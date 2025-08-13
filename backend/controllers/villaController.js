import Villa from '../models/villa.js';
import Admin from '../models/admin.js';

export const createVilla = async (req, res) => {
  try {
    const { villaId, villaName, adminId } = req.body;

    // Fetch the admin to get the companyId
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    const newVilla = new Villa({
      villaId,
      villaName,
      adminId,
      companyId: admin.companyId, // get companyId from admin
    });

    await newVilla.save();

    res.status(201).json({ message: 'Villa created successfully', villa: newVilla });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create villa', error: error.message });
  }
};


// Get all villas
export const getVillas = async (req, res) => {
  try {
    const villas = await Villa.find();
    res.status(200).json(villas);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch villas', error: error.message });
  }
};


