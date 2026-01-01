import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

export function useSuggestionLearning() {
  const { accessToken: token, user } = useContext(AuthContext);
  
  const userId = user?.userId;

  const learnFromSubmission = async (formData, category) => {
    if (!userId) {
      console.error('⚠️ Learning skipped: missing userId', { 
        hasUser: !!user, 
        userKeys: user ? Object.keys(user) : 'no user'
      });
      return;
    }
    
    if (!formData || !category) {
      console.warn('⚠️ Learning skipped: missing formData or category');
      return;
    }

    try {
      const fields = Object.entries(formData)
        .filter(([fieldName, value]) => {
          if (value === null || value === undefined || value === '') return false;
          if (typeof value === 'object') return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          return true;
        })
        .map(([fieldName, value]) => ({
          category,
          fieldName,
          value: String(value).trim(),
        }));

      if (fields.length === 0) {
        console.log(`ℹ️ No fields to learn for category "${category}"`);
        return;
      }

      console.log(`📚 Learning ${fields.length} fields for category "${category}":`, fields);

      const response = await fetch('/api/suggestions/batch-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Contextual learning recorded:', result);
      
    } catch (error) {
      console.error('❌ Failed to submit or learn from form:', error);
    }
  };

  return { learnFromSubmission };
}