import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['policy_update', 'leadership_announcement', 'event_invitation', 'general_update', 'urgent_notice'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    subject: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    }
  },
  variables: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['text', 'date', 'number'], default: 'text' },
    required: { type: Boolean, default: true }
  }],
  tone: {
    type: String,
    enum: ['professional', 'friendly', 'urgent', 'celebratory'],
    default: 'professional'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

templateSchema.index({ category: 1, isPublic: 1 });
templateSchema.index({ createdBy: 1 });

export default mongoose.model('Template', templateSchema);