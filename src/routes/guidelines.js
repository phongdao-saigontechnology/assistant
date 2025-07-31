import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import Joi from 'joi';
import Guidelines from '../models/Guidelines.js';
import { roleAuth } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/guidelines/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `guideline-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.txt', '.doc', '.docx', '.pdf', '.md'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only TXT, DOC, DOCX, PDF, and MD files are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

const guidelinesSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  content: Joi.string().required(),
  toneGuidelines: Joi.object({
    professional: Joi.string().allow(''),
    friendly: Joi.string().allow(''),
    urgent: Joi.string().allow(''),
    celebratory: Joi.string().allow('')
  }).default({}),
  brandVoice: Joi.object({
    personality: Joi.array().items(Joi.string()).default([]),
    vocabulary: Joi.object({
      preferred: Joi.array().items(Joi.string()).default([]),
      avoid: Joi.array().items(Joi.string()).default([])
    }).default({}),
    formatting: Joi.object().default({})
  }).default({}),
  examples: Joi.array().items(
    Joi.object({
      scenario: Joi.string().required(),
      goodExample: Joi.string().required(),
      badExample: Joi.string().allow(''),
      explanation: Joi.string().required()
    })
  ).default([])
});

async function ensureUploadDirectory() {
  try {
    await fs.access('uploads/guidelines/');
  } catch {
    await fs.mkdir('uploads/guidelines/', { recursive: true });
  }
}

router.post('/', roleAuth('hr', 'communications'), async (req, res, next) => {
  try {
    const { error } = guidelinesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await Guidelines.updateMany(
      { company: req.user.company, isActive: true },
      { isActive: false }
    );

    const guidelines = new Guidelines({
      ...req.body,
      company: req.user.company,
      createdBy: req.user._id,
      isActive: true
    });

    await guidelines.save();
    await guidelines.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Guidelines created successfully',
      data: guidelines
    });
  } catch (error) {
    next(error);
  }
});

router.post('/upload', roleAuth('hr', 'communications'), async (req, res, next) => {
  try {
    await ensureUploadDirectory();
    
    upload.single('guideline')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        const filePath = req.file.path;
        let content = '';

        const ext = path.extname(req.file.originalname).toLowerCase();
        
        if (ext === '.txt' || ext === '.md') {
          content = await fs.readFile(filePath, 'utf8');
        } else {
          content = `File uploaded: ${req.file.originalname}\nFile type: ${ext}\nSize: ${req.file.size} bytes\n\nPlease manually extract and input the content from this file.`;
        }

        const uploadInfo = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          uploadedAt: new Date(),
          content: content.substring(0, 10000) // Limit content length
        };

        res.json({
          message: 'File uploaded successfully',
          file: uploadInfo
        });
      } catch (error) {
        await fs.unlink(req.file.path).catch(() => {});
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { active = 'true', page = 1, limit = 10 } = req.query;
    
    const query = { company: req.user.company };
    if (active === 'true') {
      query.isActive = true;
    }

    const guidelines = await Guidelines.find(query)
      .populate('createdBy', 'name email')
      .sort({ version: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Guidelines.countDocuments(query);

    res.json({
      guidelines,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (req, res, next) => {
  try {
    const guidelines = await Guidelines.findOne({
      company: req.user.company,
      isActive: true
    }).populate('createdBy', 'name email');

    if (!guidelines) {
      return res.status(404).json({ 
        error: 'No active guidelines found for your company' 
      });
    }

    res.json(guidelines);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const guidelines = await Guidelines.findOne({
      _id: req.params.id,
      company: req.user.company
    }).populate('createdBy', 'name email');

    if (!guidelines) {
      return res.status(404).json({ error: 'Guidelines not found' });
    }

    res.json(guidelines);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', roleAuth('hr', 'communications'), async (req, res, next) => {
  try {
    const { error } = guidelinesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingGuidelines = await Guidelines.findOne({
      _id: req.params.id,
      company: req.user.company
    });

    if (!existingGuidelines) {
      return res.status(404).json({ error: 'Guidelines not found' });
    }

    if (req.body.isActive && !existingGuidelines.isActive) {
      await Guidelines.updateMany(
        { company: req.user.company, isActive: true },
        { isActive: false }
      );
    }

    const guidelines = await Guidelines.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        version: existingGuidelines.version + 1
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Guidelines updated successfully',
      data: guidelines
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', roleAuth('hr', 'communications'), async (req, res, next) => {
  try {
    const guidelines = await Guidelines.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company
    });

    if (!guidelines) {
      return res.status(404).json({ error: 'Guidelines not found' });
    }

    res.json({ message: 'Guidelines deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/activate', roleAuth('hr', 'communications'), async (req, res, next) => {
  try {
    await Guidelines.updateMany(
      { company: req.user.company, isActive: true },
      { isActive: false }
    );

    const guidelines = await Guidelines.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      { isActive: true },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!guidelines) {
      return res.status(404).json({ error: 'Guidelines not found' });
    }

    res.json({
      message: 'Guidelines activated successfully',
      data: guidelines
    });
  } catch (error) {
    next(error);
  }
});

router.get('/uploads/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', 'guidelines', filename);
    
    try {
      await fs.access(filePath);
      res.download(filePath);
    } catch {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;