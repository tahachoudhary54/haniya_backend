import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    let admin = await User.findOne({ email: 'noorhaniya2024@gmail.com' });
    if (admin) {
      admin.role = 'admin';
      admin.isVerified = true;
      await admin.save();
      console.log('Admin already existed, but role was updated to admin.');
      process.exit();
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      fullName: 'Super Admin',
      companyName: 'Haniya Garments',
      email: 'noorhaniya2024@gmail.com',
      password: hashedPassword,
      isVerified: true,
      role: 'admin',
      phone: '1234567890'
    });
    
    console.log('Admin user created successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
