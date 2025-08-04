import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/admin.js';

// Load environment variables from .env file
dotenv.config({ path: '../.env' }); 

const MONGO_URI = process.env.MONGO_URI;

const createSuperAdmin = async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not defined.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);

    const username = 'superadmin';
    const email = 'superadmin@gmail.com';
    const password = 'SuperAdmin@123'; // Change this after first login!
    const role = 'superadmin';

    const exists = await Admin.findOne({ username });
    if (exists) {
      console.log('Super admin already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await superAdmin.save();
    console.log('Super admin created successfully!');
  } catch (err) {
    console.error('Error creating super admin:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSuperAdmin();
