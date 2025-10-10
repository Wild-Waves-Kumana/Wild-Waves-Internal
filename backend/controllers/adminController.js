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
    const { username, email, currentPassword, newPassword, confirmPassword } = req.body;
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;

    // Find admin
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Handle password change
    if (newPassword || confirmPassword) {
      // If currentPassword is provided, validate it (normal change)
      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect.' });
        }
      }
      // If no currentPassword, it's a reset (allowed)
      
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'New password and confirmation are required.' });
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