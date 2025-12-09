import User from '../models/user.js';
import Admin from '../models/admin.js';
import Company from '../models/company.js';
import Booking from '../models/booking.js';
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
      user = await Admin.findOne({ email: username });
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

//sign up - Updated to include bookingId
export const registerUser = async (req, res) => {
    const { 
      username, 
      password, 
      avatarUrl, 
      role, 
      adminId, 
      checkinDate, 
      checkoutDate, 
      villaId, 
      rooms,
      bookingId // <-- Add bookingId
    } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Fetch the admin to get the companyId
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        // Verify booking exists if bookingId is provided
        if (bookingId) {
          const booking = await Booking.findById(bookingId);
          if (!booking) {
            return res.status(400).json({ message: 'Booking not found' });
          }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save adminId, companyId, checkinDate, checkoutDate, villaId, rooms, and bookingId with the new user
        const newUser = new User({
            username,
            password: hashedPassword,
            avatarUrl: avatarUrl || 'No Avatar',
            role: role || 'user',
            adminId,
            companyId: admin.companyId,
            checkinDate,
            checkoutDate,
            villaId,
            rooms, // <-- Array of room ObjectIds
            bookingId // <-- Reference to Booking document _id
        });
        await newUser.save();

        // Push user's _id to the company's users array
        await Company.findByIdAndUpdate(
          admin.companyId,
          { $push: { users: newUser._id } }
        );

        // Update booking to mark user signup complete
        if (bookingId) {
          await Booking.findByIdAndUpdate(
            bookingId,
            { userSignup: true }
          );
        }

        // Return user without password
        const userResponse = {
          _id: newUser._id,
          username: newUser.username,
          avatarUrl: newUser.avatarUrl,
          role: newUser.role,
          adminId: newUser.adminId,
          companyId: newUser.companyId,
          checkinDate: newUser.checkinDate,
          checkoutDate: newUser.checkoutDate,
          villaId: newUser.villaId,
          rooms: newUser.rooms,
          bookingId: newUser.bookingId,
          createdAt: newUser.createdAt
        };

        res.status(201).json({ 
          message: 'User created successfully', 
          user: userResponse 
        });
    }
    catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Check username uniqueness
export const checkUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ available: false });
    }
    return res.json({ available: true });
  } catch (err) {
    res.status(500).json({ available: false, message: 'Server error' });
  }
};

// Admin registration
export const registerAdmin = async (req, res) => {
    const { username, email, password, role, companyId } = req.body;

    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save admin with companyId as ObjectId
        const newAdmin = new Admin({ username, email, password: hashedPassword, role, companyId });
        await newAdmin.save();

        // Push admin's _id to the company's admins array
        await Company.findByIdAndUpdate(
          companyId,
          { $push: { admins: newAdmin._id } }
        );

        res.status(201).json({ message: 'Admin created successfully' });
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

