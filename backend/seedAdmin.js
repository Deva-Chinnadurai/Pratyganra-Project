require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/citizen-requests';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Check if default admin exists
    const adminExists = await User.findOne({ email: 'admin@citizen.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'System Admin',
        email: 'admin@citizen.com',
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        address: 'Headquarters'
      });
      
      console.log('SUCCESS: Default Admin account created!');
    } else {
      console.log('INFO: Default Admin already exists.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR creating admin:', error);
    process.exit(1);
  }
}

seedAdmin();
