import { connectDB } from '../config/database.js';
import Template from '../models/Template.js';
import Guidelines from '../models/Guidelines.js';
import User from '../models/User.js';
import { defaultTemplates } from '../templates/defaultTemplates.js';
import { defaultGuidelines } from '../templates/defaultGuidelines.js';

async function createSystemUser() {
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
    console.log('Created system user for seeding');
  }
  return systemUser;
}

async function seedTemplates(systemUser) {
  try {
    const existingTemplates = await Template.countDocuments();
    if (existingTemplates > 0) {
      console.log(`Templates already exist (${existingTemplates} found). Skipping template seed.`);
      return;
    }

    const templatesWithCreator = defaultTemplates.map(template => ({
      ...template,
      createdBy: systemUser._id
    }));

    await Template.insertMany(templatesWithCreator);
    console.log(`✓ Successfully seeded ${defaultTemplates.length} default templates`);
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  }
}

async function seedGuidelines(systemUser) {
  try {
    const existingGuidelines = await Guidelines.countDocuments();
    if (existingGuidelines > 0) {
      console.log(`Guidelines already exist (${existingGuidelines} found). Skipping guidelines seed.`);
      return;
    }

    const guidelinesWithCreator = defaultGuidelines.map(guideline => ({
      ...guideline,
      createdBy: systemUser._id
    }));

    await Guidelines.insertMany(guidelinesWithCreator);
    console.log(`✓ Successfully seeded ${defaultGuidelines.length} default guidelines`);
  } catch (error) {
    console.error('Error seeding guidelines:', error);
    throw error;
  }
}

async function seedAll() {
  try {
    console.log('Starting data seeding...');
    
    // Check for required environment variables
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI environment variable is required');
      console.log('Please set your MongoDB connection string:');
      console.log('export MONGODB_URI="mongodb://localhost:27017/your-database"');
      console.log('or add it to your .env file');
      process.exit(1);
    }
    
    await connectDB();
    
    const systemUser = await createSystemUser();
    
    await Promise.all([
      seedTemplates(systemUser),
      seedGuidelines(systemUser)
    ]);
    
    console.log('✓ Data seeding completed successfully');
  } catch (error) {
    console.error('Error during data seeding:', error);
    process.exit(1);
  }
}

async function seedTemplatesOnly() {
  try {
    console.log('Starting template seeding...');
    
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI environment variable is required');
      console.log('Please set your MongoDB connection string:');
      console.log('export MONGODB_URI="mongodb://localhost:27017/your-database"');
      console.log('or add it to your .env file');
      process.exit(1);
    }
    
    await connectDB();
    const systemUser = await createSystemUser();
    await seedTemplates(systemUser);
    console.log('✓ Template seeding completed');
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

async function seedGuidelinesOnly() {
  try {
    console.log('Starting guidelines seeding...');
    
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI environment variable is required');
      console.log('Please set your MongoDB connection string:');
      console.log('export MONGODB_URI="mongodb://localhost:27017/your-database"');
      console.log('or add it to your .env file');
      process.exit(1);
    }
    
    await connectDB();
    const systemUser = await createSystemUser();
    await seedGuidelines(systemUser);
    console.log('✓ Guidelines seeding completed');
  } catch (error) {
    console.error('Error seeding guidelines:', error);
    process.exit(1);
  }
}

// Run based on command line arguments or direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'templates':
      seedTemplatesOnly().then(() => process.exit(0));
      break;
    case 'guidelines':
      seedGuidelinesOnly().then(() => process.exit(0));
      break;
    case 'all':
    default:
      seedAll().then(() => process.exit(0));
      break;
  }
}

export { seedAll, seedTemplatesOnly, seedGuidelinesOnly };
export default seedAll;