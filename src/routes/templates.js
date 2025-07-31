import express from 'express';
import Joi from 'joi';
import Template from '../models/Template.js';
import { roleAuth } from '../middleware/auth.js';

const router = express.Router();

const templateSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().valid('policy_update', 'leadership_announcement', 'event_invitation', 'general_update', 'urgent_notice').required(),
  description: Joi.string().required(),
  content: Joi.object({
    subject: Joi.string().required(),
    body: Joi.string().required()
  }).required(),
  variables: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('text', 'date', 'number').default('text'),
    required: Joi.boolean().default(true)
  })).default([]),
  tone: Joi.string().valid('professional', 'friendly', 'urgent', 'celebratory').default('professional'),
  isPublic: Joi.boolean().default(true)
});

router.post('/', roleAuth('hr', 'communications'), async (req, res, next) => {
  try {
    const { error } = templateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const template = new Template({
      ...req.body,
      createdBy: req.user._id
    });

    await template.save();
    await template.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { category, tone, search, page = 1, limit = 10 } = req.query;
    
    const query = {
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    };

    if (category) query.category = category;
    if (tone) query.tone = tone;
    if (search) {
      query.$and = [
        query.$and || {},
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const templates = await Template.find(query)
      .populate('createdBy', 'name email')
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Template.countDocuments(query);

    res.json({
      templates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', (req, res) => {
  const categories = [
    { value: 'policy_update', label: 'Policy Update', description: 'Changes to company policies or procedures' },
    { value: 'leadership_announcement', label: 'Leadership Announcement', description: 'Messages from company leadership' },
    { value: 'event_invitation', label: 'Event Invitation', description: 'Invitations to company events or meetings' },
    { value: 'general_update', label: 'General Update', description: 'General company news and updates' },
    { value: 'urgent_notice', label: 'Urgent Notice', description: 'Time-sensitive important announcements' }
  ];
  
  res.json(categories);
});

router.get('/:id', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!template.isPublic && !template.createdBy._id.equals(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { error } = templateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({ error: 'Template not found or access denied' });
    }

    res.json({
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found or access denied' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/popular/trending', async (req, res, next) => {
  try {
    const templates = await Template.find({ isPublic: true })
      .populate('createdBy', 'name')
      .sort({ usageCount: -1 })
      .limit(5);

    res.json(templates);
  } catch (error) {
    next(error);
  }
});

export default router;