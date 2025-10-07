import bcrypt from 'bcryptjs';
import Admin from '../models/admin.js';
import Company from '../models/company.js';

// Get admin by ID (with companyId populated)
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId, 'username email companyId')
      .populate('companyId', 'companyName companyId _id');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all admins (with companyId populated)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate('companyId', 'companyName companyId _id');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin details (username, email, password)
export const updateAdmin = async (req, res) => {
  try {
    const { username, email, oldPassword, newPassword, confirmPassword } = req.body;
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;

    // Find admin
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Handle password change
    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'All password fields are required.' });
      }
      // Check old password
      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match.' });
      }
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.adminId,
      { $set: updateFields },
      { new: true, select: 'username email companyId' }
    ).populate('companyId', 'companyName companyId _id');

    res.json(updatedAdmin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};