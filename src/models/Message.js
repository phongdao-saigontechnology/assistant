import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  originalPrompt: {
    type: String,
    required: true
  },
  tone: {
    type: String,
    enum: ['professional', 'friendly', 'urgent', 'celebratory'],
    required: true
  },
  category: {
    type: String,
    enum: ['policy_update', 'leadership_announcement', 'event_invitation', 'general_update', 'urgent_notice'],
    required: true
  },
  templateUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft'
  },
  scheduledFor: {
    type: Date
  },
  distributions: [{
    platform: {
      type: String,
      enum: ['slack', 'teams', 'email'],
      required: true
    },
    target: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    messageId: String,
    error: String
  }],
  aiAnalysis: {
    tonalConsistency: Number,
    clarityScore: Number,
    brandAlignment: Number,
    suggestions: [String]
  }
}, {
  timestamps: true
});

messageSchema.index({ createdBy: 1, status: 1 });
messageSchema.index({ category: 1 });
messageSchema.index({ scheduledFor: 1, status: 1 });

export default mongoose.model('Message', messageSchema);