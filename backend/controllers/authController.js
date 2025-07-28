import User from '../models/user.js';
import Admin from '../models/admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


//log in
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // First check User collection
    let user = await User.findOne({ username });
    let userType = 'user';

    // If not found in User, check Admin collection
    if (!user) {
      user = await Admin.findOne({ username });
      userType = 'admin';
    }

    // If still not found
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { username: user.username, _id: user._id, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


//sign up
export const registerUser = async (req, res) => {
    const { roomname, roomid, username, password, role, adminId } = req.body; // <-- add adminId

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10); // generate salt
        const hashedPassword = await bcrypt.hash(password, salt); // hash password

        // Save adminId with the new user
        const newUser = new User({ roomname, roomid, username, password: hashedPassword, role, adminId });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin registration
export const registerAdmin = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({ username, email, password: hashedPassword, role });
        await newAdmin.save();

        res.status(201).json({ message: 'Admin created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};