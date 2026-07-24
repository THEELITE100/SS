const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('   Check MONGO_URI in backend/.env — see README.md for the Atlas setup steps.');
    process.exit(1);
  }
};

module.exports = connectDB;
