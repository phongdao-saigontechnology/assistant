import mongoose from 'mongoose';

const guidelinesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  toneGuidelines: {
    professional: String,
    friendly: String,
    urgent: String,
    celebratory: String
  },
  brandVoice: {
    personality: [String],
    vocabulary: {
      preferred: [String],
      avoid: [String]
    },
    formatting: {
      type: Object,
      default: {}
    }
  },
  examples: [{
    scenario: String,
    goodExample: String,
    badExample: String,
    explanation: String
  }],
  company: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

guidelinesSchema.index({ company: 1, isActive: 1 });
guidelinesSchema.index({ createdBy: 1 });

export default mongoose.model('Guidelines', guidelinesSchema);