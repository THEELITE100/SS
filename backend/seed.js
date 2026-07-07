const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Gig = require('./models/Gig');
const FreelancerProfile = require('./models/FreelancerProfile');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔄 Connected to MongoDB Atlas. Synchronizing indexes...');

    await User.createIndexes();
    await Gig.createIndexes();
    await FreelancerProfile.createIndexes();
    console.log('✅ Geospatial 2dsphere indexes verified.');

    await Gig.deleteMany({});
    await User.deleteMany({ email: { $in: ['client@skillsphere.io', 'dev@skillsphere.io'] } });

    const client = await User.create({
      name: 'TechHub Noida Enterprise',
      email: 'client@skillsphere.io',
      password: 'Password123!',
      role: 'client',
      location: { city: 'Noida', coordinates: [77.3910, 28.5355] }
    });

    await Gig.create([
      {
        client: client._id,
        title: 'Senior React & Tailwind Developer for Luxury Dashboard',
        description: 'Looking for a verified MERN stack specialist in Noida to architect an Apple-inspired analytics portal with real-time Socket.IO widgets.',
        category: 'Web Development',
        requiredSkills: ['React', 'Tailwind CSS', 'Redux Toolkit', 'Socket.IO'],
        budgetType: 'fixed',
        budgetRange: { min: 80000, max: 150000 },
        locationRequirement: 'hyperlocal',
        targetCoordinates: [77.3910, 28.5355], 
        status: 'open'
      },
      {
        client: client._id,
        title: 'AI Machine Learning Engineer (HuggingFace Integration)',
        description: 'Need an AI consultant to fine-tune semantic similarity matching algorithms for our hiring engine. Must have experience with vector embeddings.',
        category: 'AI & Machine Learning',
        requiredSkills: ['Python', 'HuggingFace', 'NLP', 'Node.js'],
        budgetType: 'fixed',
        budgetRange: { min: 120000, max: 250000 },
        locationRequirement: 'remote',
        targetCoordinates: [77.2090, 28.6139],
        status: 'open'
      },
      {
        client: client._id,
        title: 'Full-Stack Node.js & MongoDB Atlas Architecture Audit',
        description: 'Seeking a backend database expert to optimize aggregation pipelines and configure Stripe Connect escrow splits.',
        category: 'DevOps & Cloud',
        requiredSkills: ['Node.js', 'MongoDB', 'Stripe API', 'Express'],
        budgetType: 'hourly',
        budgetRange: { min: 2500, max: 4500 },
        locationRequirement: 'hyperlocal',
        targetCoordinates: [77.3700, 28.6280], 
        status: 'open'
      }
    ]);

    console.log('🎉 Successfully seeded 3 Noida/NCR Gigs! Your marketplace is now live.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();