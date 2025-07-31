import express from 'express';
import Joi from 'joi';
import Message from '../models/Message.js';
import User from '../models/User.js';
import integrationService from '../services/integrationService.js';

const router = express.Router();

const sendMessageSchema = Joi.object({
  messageId: Joi.string().required(),
  distributions: Joi.array().items(
    Joi.object({
      platform: Joi.string().valid('slack', 'teams', 'email').required(),
      config: Joi.object().required()
    })
  ).required()
});

const testConnectionSchema = Joi.object({
  platform: Joi.string().valid('slack', 'teams', 'email').required(),
  config: Joi.object().required()
});

router.post('/send', async (req, res, next) => {
  try {
    const { error } = sendMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { messageId, distributions } = req.body;
    
    const message = await Message.findOne({
      _id: messageId,
      createdBy: req.user._id
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const results = [];
    
    for (const distribution of distributions) {
      try {
        const result = await integrationService.sendMessage({
          platform: distribution.platform,
          config: distribution.config,
          subject: message.subject,
          content: message.content,
          userEmail: req.user.email,
          userName: req.user.name
        });

        const distributionResult = {
          platform: distribution.platform,
          target: distribution.config.channel || distribution.config.to || 'Unknown',
          status: result.success ? 'sent' : 'failed',
          messageId: result.messageId,
          error: result.error,
          sentAt: result.success ? new Date() : null
        };

        message.distributions.push(distributionResult);
        results.push(distributionResult);
        
      } catch (error) {
        const distributionResult = {
          platform: distribution.platform,
          target: distribution.config.channel || distribution.config.to || 'Unknown',
          status: 'failed',
          error: error.message
        };
        
        message.distributions.push(distributionResult);
        results.push(distributionResult);
      }
    }

    message.status = 'published';
    await message.save();

    res.json({
      message: 'Distribution completed',
      results
    });
  } catch (error) {
    next(error);
  }
});

router.post('/test-connection', async (req, res, next) => {
  try {
    const { error } = testConnectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { platform, config } = req.body;
    let result;

    switch (platform) {
      case 'slack':
        result = await integrationService.testSlackConnection(config.token);
        break;
        
      case 'email':
        result = await integrationService.testEmailConnection();
        break;
        
      case 'teams':
        result = { success: false, error: 'Teams connection test not implemented yet' };
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/slack/channels', async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Slack token is required' });
    }

    const result = await integrationService.getSlackChannels(token);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/user-integrations', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('preferences.integrations');
    res.json(user.preferences.integrations);
  } catch (error) {
    next(error);
  }
});

router.put('/user-integrations', async (req, res, next) => {
  try {
    const integrationSchema = Joi.object({
      slack: Joi.object({
        enabled: Joi.boolean().default(false),
        workspaceId: Joi.string().allow(''),
        channelId: Joi.string().allow('')
      }).default({}),
      teams: Joi.object({
        enabled: Joi.boolean().default(false),
        tenantId: Joi.string().allow(''),
        teamId: Joi.string().allow('')
      }).default({}),
      email: Joi.object({
        enabled: Joi.boolean().default(true),
        distributionLists: Joi.array().items(Joi.string()).default([])
      }).default({})
    });

    const { error } = integrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'preferences.integrations': req.body },
      { new: true, runValidators: true }
    ).select('preferences.integrations');

    res.json({
      message: 'Integration preferences updated',
      integrations: user.preferences.integrations
    });
  } catch (error) {
    next(error);
  }
});

router.post('/schedule', async (req, res, next) => {
  try {
    const scheduleSchema = Joi.object({
      messageId: Joi.string().required(),
      scheduledFor: Joi.date().min('now').required(),
      distributions: Joi.array().items(
        Joi.object({
          platform: Joi.string().valid('slack', 'teams', 'email').required(),
          config: Joi.object().required()
        })
      ).required()
    });

    const { error } = scheduleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { messageId, scheduledFor, distributions } = req.body;
    
    const message = await Message.findOneAndUpdate(
      { _id: messageId, createdBy: req.user._id },
      { 
        scheduledFor: new Date(scheduledFor),
        status: 'scheduled'
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const scheduleResult = await integrationService.scheduleMessage({
      messageId,
      distributions,
      subject: message.subject,
      content: message.content,
      userEmail: req.user.email,
      userName: req.user.name
    }, scheduledFor);

    res.json({
      message: 'Message scheduled successfully',
      scheduledFor,
      data: message
    });
  } catch (error) {
    next(error);
  }
});

router.get('/delivery-status/:messageId', async (req, res, next) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      createdBy: req.user._id
    }).select('distributions status scheduledFor');

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const summary = {
      total: message.distributions.length,
      sent: message.distributions.filter(d => d.status === 'sent').length,
      failed: message.distributions.filter(d => d.status === 'failed').length,
      pending: message.distributions.filter(d => d.status === 'pending').length
    };

    res.json({
      messageStatus: message.status,
      scheduledFor: message.scheduledFor,
      distributions: message.distributions,
      summary
    });
  } catch (error) {
    next(error);
  }
});

export default router;