import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js'
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';


const router = express.Router();
const prisma = new PrismaClient();

// To handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/templates/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

//upload file logic
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== '.docx') {
      return cb(new Error('Only .docx files are allowed'), false);
    }
    cb(null, true);
  },
});


// POST /api/templates/upload
router.post('/upload', upload.single('template'), async (req, res) => {
  try {
    const userId = req.user?.userId;
    const file = req.file;
    const { description } = req.body;


    if (!userId) { return res.status(401).json({ error: 'Unauthorized' }); }

    if (!file) { return res.status(400).json({ error: 'No file uploaded' }); }

    const template = await prisma.template.create({
      data: {
        name: file.originalname,
        fileUrl: `/uploads/templates/${file.filename}`,
        description: description || null, 
        userId,
      },
    });

    res.json(template);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Template upload failed' });
  }
});


// GET /api/templates
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {  return res.status(401).json({ error: 'Unauthorized' }); }

    const templates = await prisma.template.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        fileUrl: true,
        createdAt: true, // sorting purposes
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});


// PUT /api/templates/:id to edit metadata
router.put('/:id', async (req, res) => {
  const templateId = Number(req.params.id);
  const userId = req.user?.userId;
  const { name, description } = req.body;

  try {
    // Check user/template connection
    const existing = await prisma.template.findUnique({ where: { id: templateId } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Template not found or unauthorized' });
    }

    const updated = await prisma.template.update({
      where: { id: templateId },
      data: { name, description },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/templates/;id to delete a template from list
router.delete('/:id', async (req, res) => {
  const templateId = Number(req.params.id);
  const userId = req.user?.userId;

  try {
    // Check template belongs to user
    const existing = await prisma.template.findUnique({ where: { id: templateId } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Template not found or unauthorized' });
    }

    await prisma.template.delete({ where: { id: templateId } });
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});


// fetch template to frontend for zip and gen report

// GET /api/templates/:id/download
router.get('/:id/download', async (req, res) => {
  const templateId = Number(req.params.id);
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template || template.userId !== userId) {
    return res.status(404).json({ error: 'Template not found or unauthorized' });
  }

  const filePath = path.join(__dirname, '..', template.fileUrl);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on server' });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.sendFile(filePath);
});




export default router;
