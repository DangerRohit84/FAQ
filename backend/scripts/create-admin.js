const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function createAdmin() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faq-app';
  const name = process.argv[2] || 'Admin';
  const email = process.argv[3] || 'admin@faq.com';
  const password = process.argv[4] || 'admin123';

  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin with email "${email}" already exists.`);
      process.exit(0);
    }
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin created: ${name} <${email}>`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
