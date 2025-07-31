import express from 'express';
import Joi from 'joi';
import Message from '../models/Message.js';
import Template from '../models/Template.js';
import aiService from '../services/aiService.js';

const router = express.Router();

const generateMessageSchema = Joi.object({
  prompt: Joi.string().required(),
  tone: Joi.string().valid('professional', 'friendly', 'urgent', 'celebratory').default('professional'),
  category: Joi.string().valid('policy_update', 'leadership_announcement', 'event_invitation', 'general_update', 'urgent_notice').required(),
  templateId: Joi.string().optional(),
  targetAudience: Joi.string().optional(),
  keyPoints: Joi.array().items(Joi.string()).optional(),
  callToAction: Joi.string().optional()
});

const saveMessageSchema = Joi.object({
  title: Joi.string().required(),
  subject: Joi.string().required(),
  content: Joi.string().required(),
  originalPrompt: Joi.string().required(),
  tone: Joi.string().valid('professional', 'friendly', 'urgent', 'celebratory').required(),
  category: Joi.string().valid('policy_update', 'leadership_announcement', 'event_invitation', 'general_update', 'urgent_notice').required(),
  templateUsed: Joi.string().optional()
});

router.post('/generate', async (req, res, next) => {
  try {
    const { error } = generateMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { prompt, tone, category, templateId, ...options } = req.body;
    
    let templateContent = null;
    if (templateId) {
      const template = await Template.findById(templateId);
      if (template) {
        templateContent = template.content;
        await Template.findByIdAndUpdate(templateId, { $inc: { usageCount: 1 } });
      }
    }

    const result = await aiService.generateMessage(prompt, {
      tone,
      category,
      company: req.user.company,
      userId: req.user._id,
      templateContent,
      ...options
    });

    const [subject, ...bodyParts] = result.content.split('\n');
    const cleanSubject = subject.replace(/^SUBJECT:\s*/i, '').trim();
    const cleanBody = bodyParts.join('\n').replace(/^BODY:\s*/i, '').trim();

    res.json({
      subject: cleanSubject,
      content: cleanBody,
      analysis: result.analysis,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    next(error);
  }
});

router.post('/save', async (req, res, next) => {
  try {
    const { error } = saveMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const messageData = {
      ...req.body,
      createdBy: req.user._id
    };

    const message = new Message(messageData);
    await message.save();

    await message.populate('createdBy', 'name email role');
    
    res.status(201).json({
      message: 'Message saved successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const query = { createdBy: req.user._id };
    
    if (status) query.status = status;
    if (category) query.category = category;

    const messages = await Message.find(query)
      .populate('templateUsed', 'name category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);

    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('templateUsed', 'name category description');

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/improve', async (req, res, next) => {
  try {
    const { feedback } = req.body;
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }

    const message = await Message.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const guidelines = await aiService.getActiveGuidelines(req.user.company);
    const improvedContent = await aiService.improveMessage(
      `SUBJECT: ${message.subject}\nBODY: ${message.content}`,
      feedback,
      guidelines
    );

    const [subject, ...bodyParts] = improvedContent.split('\n');
    const cleanSubject = subject.replace(/^SUBJECT:\s*/i, '').trim();
    const cleanBody = bodyParts.join('\n').replace(/^BODY:\s*/i, '').trim();

    res.json({
      subject: cleanSubject,
      content: cleanBody
    });
  } catch (error) {
    next(error);
  }
});

export default router;