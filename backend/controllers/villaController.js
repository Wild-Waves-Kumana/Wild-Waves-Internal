import Villa from '../models/villa.js';
import Admin from '../models/admin.js';
import Company from '../models/company.js'; // <-- import Company

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

    // --- Add the villa _id to the company's villas array ---
    await Company.findByIdAndUpdate(
      admin.companyId,
      { $addToSet: { villas: newVilla._id } }, // $addToSet avoids duplicates
      { new: true }
    );
    // ------------------------------------------------------

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

export const getVillasbyId = async (req, res) => {
  const { villa_id } = req.params;
  try {
    const villa = await Villa.findById(villa_id);
    if (!villa) {
      return res.status(404).json({ message: 'Villa not found' });
    }
    res.status(200).json(villa);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch villa', error: error.message });
  }
};
