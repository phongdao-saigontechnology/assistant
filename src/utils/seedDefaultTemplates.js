import { connectDB } from '../config/database.js';
import Template from '../models/Template.js';
import User from '../models/User.js';
import { defaultTemplates } from '../templates/defaultTemplates.js';

async function seedDefaultTemplates() {
  try {
    await connectDB();
    
    // Check if templates already exist
    const existingTemplates = await Template.countDocuments();
    if (existingTemplates > 0) {
      console.log('Templates already exist. Skipping seed.');
      return;
    }

    // Create a system user for default templates
    let systemUser = await User.findOne({ email: 'system@internal.com' });
    if (!systemUser) {
      systemUser = new User({
        name: 'System',
        email: 'system@internal.com',
        password: 'system-password-not-used',
        role: 'communications',
        department: 'System',
        company: 'System'
      });
      await systemUser.save();
    }

    // Insert default templates
    const templatesWithCreator = defaultTemplates.map(template => ({
      ...template,
      createdBy: systemUser._id
    }));

    await Template.insertMany(templatesWithCreator);
    
    console.log(`Successfully seeded ${defaultTemplates.length} default templates`);
    
  } catch (error) {
    console.error('Error seeding default templates:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDefaultTemplates().then(() => process.exit(0));
}

export default seedDefaultTemplates;