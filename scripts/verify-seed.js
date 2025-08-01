import { connectDB } from '../src/config/database.js';
import Template from '../src/models/Template.js';
import Guidelines from '../src/models/Guidelines.js';

async function verifySeed() {
  try {
    await connectDB();
    
    const templateCount = await Template.countDocuments();
    const guidelinesCount = await Guidelines.countDocuments();
    
    console.log('=== Seed Verification ===');
    console.log(`Templates in database: ${templateCount}`);
    console.log(`Guidelines in database: ${guidelinesCount}`);
    
    if (templateCount > 0 && guidelinesCount > 0) {
      console.log('✓ Database successfully seeded!');
      
      // Show template categories
      const templates = await Template.find({}, 'name category').lean();
      console.log('\nTemplate categories:');
      templates.forEach(t => console.log(`- ${t.name} (${t.category})`));
      
      // Show guidelines
      const guidelines = await Guidelines.find({}, 'name company').lean();
      console.log('\nGuidelines:');
      guidelines.forEach(g => console.log(`- ${g.name} (${g.company})`));
      
    } else {
      console.log('⚠ Database appears to be empty or partially seeded');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying seed:', error);
    process.exit(1);
  }
}

verifySeed();