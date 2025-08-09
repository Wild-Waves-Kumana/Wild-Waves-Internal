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