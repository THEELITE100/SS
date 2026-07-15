require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    const adminExists = await User.findOne({ email: 'admin@skillsphere.com' });
    if (adminExists) {
      console.log('Admin already exists. You can log in with admin@skillsphere.com');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'System Admin',
      email: 'admin@skillsphere.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    console.log('✅ Super Admin created successfully!');
    console.log('Email: admin@skillsphere.com');
    console.log('Password: Admin@123');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();