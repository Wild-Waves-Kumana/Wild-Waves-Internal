import User from '../models/user.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
  try {
    // Select companyId as well for filtering
    const users = await User.find({}, 'villaName villaId username companyId');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUser =  async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { villaName, villaId, username, password } = req.body;

    // Build update object
    const updateFields = {};
    if (villaName) updateFields.villaName = villaName;
    if (villaId) updateFields.villaId = villaId;
    if (username) updateFields.username = username;

    // If password is provided, hash it and update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};