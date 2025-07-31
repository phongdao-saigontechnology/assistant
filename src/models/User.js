import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['hr', 'business_leader', 'communications'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  preferences: {
    defaultTone: {
      type: String,
      enum: ['professional', 'friendly', 'urgent', 'celebratory'],
      default: 'professional'
    },
    integrations: {
      slack: {
        enabled: { type: Boolean, default: false },
        workspaceId: String,
        channelId: String
      },
      teams: {
        enabled: { type: Boolean, default: false },
        tenantId: String,
        teamId: String
      },
      email: {
        enabled: { type: Boolean, default: true },
        distributionLists: [String]
      }
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);