import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = express.Router();
const prisma = new PrismaClient();

const USAGE_THRESHOLD = 1;

// Context correlation threshold (0-1 scale)
const CONTEXT_THRESHOLD = 0.6;

const calculateContextScore = async (userId, category, fieldName, contextData, suggestionText) => {
  if (!contextData || Object.keys(contextData).length === 0) return 0;

  let totalScore = 0; 
  let weightedSum = 0;

  // Check direct context patterns
  for (const [contextField, contextValue] of Object.entries(contextData)) {
    if (!contextValue) continue;

    const pattern = await prisma.contextualPattern.findFirst({
      where: {
        userId,
        category,
        targetField: fieldName,
        contextField,
        contextValue: String(contextValue).trim(),
        suggestionText,
      },
    });

    if (pattern) {
      const weight = pattern.frequency;
      weightedSum += weight;
      
      const totalForContext = await prisma.contextualPattern.aggregate({
        where: {
          userId,
          category,
          targetField: fieldName,
          contextField,
          contextValue: String(contextValue).trim(),
        },
        _sum: { frequency: true },
      });

      const totalFreq = totalForContext._sum.frequency || 1;
      const probability = weight / totalFreq;
      totalScore += probability * weight;
    }
  }

  const contextFieldCount = Object.keys(contextData).filter(k => contextData[k]).length;
  return contextFieldCount > 0 ? Math.min(totalScore / (weightedSum || 1), 1) : 0;
};

// ==========================================
// GET /api/suggestions/intelligent
// ==========================================
router.get('/intelligent', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { category, fieldName, ageMonths, tab = 'frequent', context } = req.query;

    console.log(`[API] GET /intelligent - userId: ${userId}, category: ${category}, fieldName: ${fieldName}, tab: ${tab}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contextData = context ? JSON.parse(context) : {};
    let suggestions = [];

    if (tab === 'frequent' || !tab) {
      // ✅ FIX: Query with proper threshold
      const userSuggestions = await prisma.userSuggestion.findMany({
        where: {
          userId,
          category,
          fieldName,
          usageCount: { gte: USAGE_THRESHOLD }, // Will show items with usageCount >= 1
        },
        orderBy: [
          { isPinned: 'desc' },
          { usageCount: 'desc' },
        ],
      });

      console.log(`[API] Found ${userSuggestions.length} user suggestions for ${category}.${fieldName}`);

      // Calculate context scores for all suggestions
      const enrichedUserSuggestions = await Promise.all(
        userSuggestions.map(async (s) => {
          const contextScore = await calculateContextScore(
            userId,
            category,
            fieldName,
            contextData,
            s.suggestionText
          );
          
          return {
            id: s.id,
            text: s.suggestionText,
            source: 'user',
            usageCount: s.usageCount,
            isPinned: s.isPinned || false,
            contextScore,
          };
        })
      );

      suggestions = [...enrichedUserSuggestions];

      // Remove duplicates
      const seenTexts = new Set();
      suggestions = suggestions.filter((s) => {
        const lower = s.text.toLowerCase();
        if (seenTexts.has(lower)) return false;
        seenTexts.add(lower);
        return true;
      });

      // Sort: pinned first, then by context score, then by usage
      suggestions.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
        if (Math.abs(a.contextScore - b.contextScore) > 0.1) {
          return b.contextScore - a.contextScore;
        }
        return b.usageCount - a.usageCount;
      });

      console.log(`[API] Returning ${suggestions.length} suggestions:`, 
        suggestions.map(s => ({ text: s.text, usage: s.usageCount, pinned: s.isPinned, context: s.contextScore }))
      );

    } else if (tab === 'age' && ageMonths) {
      const age = parseInt(ageMonths);

      const ageSuggestions = await prisma.ageBasedSuggestion.findMany({
        where: {
          category,
          fieldName,
          minAgeMonths: { lte: age },
          maxAgeMonths: { gte: age },
          OR: [{ userId }, { isSystemDefault: true }],
        },
        orderBy: [
          { isSystemDefault: 'desc' },
          { usageCount: 'desc' },
        ],
      });

      suggestions = ageSuggestions.map((s) => ({
        id: s.id,
        text: s.suggestionText,
        source: 'user',
        usageCount: s.usageCount,
        isPinned: false,
        contextScore: 0,
        ageRange: `${s.minAgeMonths}-${s.maxAgeMonths}mo`,
      }));

    } else if (tab === 'contextual') {
      const contextualSuggestions = [];

      for (const [contextField, contextValue] of Object.entries(contextData)) {
        if (!contextValue) continue;

        const patterns = await prisma.contextualPattern.findMany({
          where: {
            userId,
            category,
            targetField: fieldName,
            contextField,
            contextValue: String(contextValue).trim(),
          },
          orderBy: { frequency: 'desc' },
          take: 10,
        });

        console.log(`[API] Found ${patterns.length} contextual patterns for ${contextField}=${contextValue}`);

        for (const pattern of patterns) {
          contextualSuggestions.push({
            id: `context-${pattern.id}`,
            text: pattern.suggestionText,
            source: 'contextual',
            usageCount: pattern.frequency,
            isPinned: false,
            contextScore: 1.0,
            context: `Often with ${contextField}="${contextValue}"`,
          });
        }
      }

      // Remove duplicates and sort by frequency
      const seenTexts = new Set();
      suggestions = contextualSuggestions
        .filter((s) => {
          const lower = s.text.toLowerCase();
          if (seenTexts.has(lower)) return false;
          seenTexts.add(lower);
          return true;
        })
        .sort((a, b) => b.usageCount - a.usageCount);

    } else if (tab === 'pinned') {
      const pinnedSuggestions = await prisma.userSuggestion.findMany({
        where: {
          userId,
          category,
          fieldName,
          isPinned: true,
        },
        orderBy: { usageCount: 'desc' },
        take: 3,
      });

      suggestions = pinnedSuggestions.map((s) => ({
        id: s.id,
        text: s.suggestionText,
        source: 'user',
        usageCount: s.usageCount,
        isPinned: true,
        contextScore: 0,
      }));
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('[API] ❌ Failed to fetch intelligent suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});


// ==========================================
// POST /api/suggestions/batch-usage
// ==========================================
router.post('/batch-usage', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { fields } = req.body;
    
    if (!userId) {
      console.error('[API] ❌ Batch usage: Unauthorized');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!fields || !Array.isArray(fields)) {
      console.error('[API] ❌ Batch usage: Invalid fields');
      return res.status(400).json({ error: 'Invalid fields data' });
    }

    console.log(`[API] 📚 Batch usage for user ${userId}:`, {
      fieldCount: fields.length,
      fields: fields.map(f => ({ cat: f.category, field: f.fieldName, val: f.value?.substring(0, 30) }))
    });

    // Group fields by category for context learning
    const byCategory = {};
    for (const field of fields) {
      if (!field.value?.trim()) continue;
      if (!byCategory[field.category]) byCategory[field.category] = {};
      byCategory[field.category][field.fieldName] = field.value.trim();
    }

    let successCount = 0;
    let errorCount = 0;

    // Upsert usage counts
    for (const { category, fieldName, value } of fields) {
      if (!value?.trim()) continue;

      try {
        const result = await prisma.userSuggestion.upsert({
          where: {
            userId_category_fieldName_suggestionText: {
              userId,
              category,
              fieldName,
              suggestionText: value.trim(),
            },
          },
          update: {
            usageCount: { increment: 1 },
            lastUsed: new Date(),
          },
          create: {
            userId,
            category,
            fieldName,
            suggestionText: value.trim(),
            usageCount: 1,
          },
        });

        console.log(`[API] ✅ Upserted ${category}.${fieldName}: "${value.substring(0, 30)}..." (usageCount: ${result.usageCount})`);
        successCount++;

        // Learn context patterns
        await learnContextPatterns(userId, category, fieldName, value.trim(), byCategory[category]);
        
      } catch (error) {
        console.error(`[API] ❌ Failed to upsert ${category}.${fieldName}:`, error.message);
        errorCount++;
      }
    }

    console.log(`[API] ✅ Batch usage complete: ${successCount} success, ${errorCount} errors`);
    
    res.json({ 
      success: true, 
      processed: successCount,
      errors: errorCount 
    });
    
  } catch (error) {
    console.error('[API] ❌ Batch usage tracking failed:', error);
    res.status(500).json({ error: 'Failed to record usage', details: error.message });
  }
});


// ==========================================
// HELPER: Learn context patterns
// ==========================================
async function learnContextPatterns(userId, category, targetField, suggestionText, allFieldData) {
  if (!allFieldData || Object.keys(allFieldData).length === 0) {
    console.log(`[API] ℹ️ No context data for ${category}.${targetField}`);
    return;
  }

  console.log(`[API] 🧠 Learning context patterns for ${category}.${targetField} with context:`, 
    Object.keys(allFieldData).filter(k => k !== targetField)
  );

  const patterns = [];

  // Learn direct context patterns
  for (const [contextField, contextValue] of Object.entries(allFieldData)) {
    if (
      contextField === targetField ||
      !contextValue ||
      typeof contextValue !== 'string'
    ) continue;

    const trimmedValue = String(contextValue).trim();

    try {
      const existingPattern = await prisma.contextualPattern.findFirst({
        where: {
          userId,
          category,
          targetField,
          contextField,
          contextValue: trimmedValue,
          suggestionText,
        },
      });

      if (existingPattern) {
        patterns.push(
          prisma.contextualPattern.update({
            where: { id: existingPattern.id },
            data: { frequency: existingPattern.frequency + 1 },
          })
        );
        console.log(`[API] 📈 Incremented pattern: ${contextField}="${trimmedValue}" → ${targetField}="${suggestionText.substring(0, 30)}..." (freq: ${existingPattern.frequency + 1})`);
      } else {
        patterns.push(
          prisma.contextualPattern.create({
            data: {
              userId,
              category,
              targetField,
              contextField,
              contextValue: trimmedValue,
              suggestionText,
              frequency: 1,
            },
          })
        );
        console.log(`[API] ✨ New pattern: ${contextField}="${trimmedValue}" → ${targetField}="${suggestionText.substring(0, 30)}..."`);
      }

      // Learn second-order context
      for (const [secondField, secondValue] of Object.entries(allFieldData)) {
        if (
          secondField === targetField ||
          secondField === contextField ||
          !secondValue ||
          typeof secondValue !== 'string'
        ) continue;

        const secondOrderPattern = await prisma.contextualPattern.findFirst({
          where: {
            userId,
            category,
            targetField: contextField,
            contextField: secondField,
            contextValue: String(secondValue).trim(),
          },
        });

        if (secondOrderPattern && secondOrderPattern.frequency > 2) {
          const nestedExisting = await prisma.contextualPattern.findFirst({
            where: {
              userId,
              category,
              targetField,
              contextField: `${secondField}→${contextField}`,
              contextValue: `${secondValue}→${trimmedValue}`,
              suggestionText,
            },
          });

          if (nestedExisting) {
            patterns.push(
              prisma.contextualPattern.update({
                where: { id: nestedExisting.id },
                data: { frequency: nestedExisting.frequency + 1 },
              })
            );
          } else {
            patterns.push(
              prisma.contextualPattern.create({
                data: {
                  userId,
                  category,
                  targetField,
                  contextField: `${secondField}→${contextField}`,
                  contextValue: `${secondValue}→${trimmedValue}`,
                  suggestionText,
                  frequency: 1,
                },
              })
            );
          }
        }
      }
    } catch (error) {
      console.error(`[API] ❌ Error learning pattern for ${targetField}:`, error.message);
    }
  }

  try {
    await Promise.all(patterns);
    console.log(`[API] ✅ Learned ${patterns.length} context patterns for ${category}.${targetField}`);
  } catch (error) {
    console.error(`[API] ❌ Error saving context patterns:`, error.message);
  }
}

// ==========================================
// PUT /api/suggestions/:id - Edit suggestion
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const suggestionId = parseInt(req.params.id);
    const { text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (isNaN(suggestionId)) {
      return res.status(400).json({ error: 'Invalid suggestion ID' });
    }

    const suggestion = await prisma.userSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion || suggestion.userId !== userId) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }

    const updated = await prisma.userSuggestion.update({
      where: { id: suggestionId },
      data: { suggestionText: text.trim() },
    });

    res.json({ success: true, suggestion: updated });
  } catch (error) {
    console.error('Failed to edit suggestion:', error);
    res.status(500).json({ error: 'Failed to edit' });
  }
});

// ==========================================
// DELETE /api/suggestions/:id
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const suggestionId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (isNaN(suggestionId)) {
      return res.status(400).json({ error: 'Invalid suggestion ID' });
    }

    const suggestion = await prisma.userSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) return res.status(404).json({ error: 'Not found' });
    if (suggestion.userId !== userId) {
      return res.status(404).json({error: 'Unauthorized' });
    }

    await prisma.userSuggestion.delete({ where: { id: suggestionId } });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete suggestion:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// ==========================================
// POST /api/suggestions/:id/pin
// ==========================================
router.post('/:id/pin', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const suggestionId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (isNaN(suggestionId)) {
      return res.status(400).json({ error: 'Invalid suggestion ID' });
    }

    const suggestion = await prisma.userSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion || suggestion.userId !== userId) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }

    // Check pin limit
    if (!suggestion.isPinned) {
      const pinnedCount = await prisma.userSuggestion.count({
        where: {
          userId,
          category: suggestion.category,
          fieldName: suggestion.fieldName,
          isPinned: true,
        },
      });

      if (pinnedCount >= 3) {
        return res.status(400).json({ error: 'Maximum 3 pins per field' });
      }
    }

    const updated = await prisma.userSuggestion.update({
      where: { id: suggestionId },
      data: { isPinned: !suggestion.isPinned },
    });

    console.log(`[API] 📌 Pin toggled for suggestion ${suggestionId}: ${updated.isPinned}`);

    res.json({ success: true, isPinned: updated.isPinned });
  } catch (error) {
    console.error('Failed to toggle pin:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

export default router;