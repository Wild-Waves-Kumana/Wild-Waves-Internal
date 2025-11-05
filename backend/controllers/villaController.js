import Villa from '../models/villa.js';
import Admin from '../models/admin.js';
import Company from '../models/company.js';

// New: return next available villaId (VIDXXX)
export const getNextVillaId = async (req, res) => {
  try {
    const regex = /^VID(\d+)$/;
    const villas = await Villa.find({ villaId: { $regex: regex } }).select('villaId').lean();

    const existingNumbers = new Set();
    villas.forEach(v => {
      const match = v.villaId && v.villaId.match(regex);
      if (match && match[1]) existingNumbers.add(parseInt(match[1], 10));
    });

    let next = 1;
    while (existingNumbers.has(next)) next++;

    const formatted = String(next).padStart(3, '0');
    const villaId = `VID${formatted}`;

    res.status(200).json({ nextVillaId: villaId });
  } catch (error) {
    console.error('getNextVillaId error:', error);
    res.status(500).json({ message: 'Failed to generate next villaId' });
  }
};

export const createVilla = async (req, res) => {
  try {
    let { villaId, villaName, description, villaLocation, hasAC, villaBasePrice, adminId } = req.body;

    // Fetch the admin to get the companyId
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    // If villaId not provided generate next available VIDXXX (3 digits minimum)
    if (!villaId) {
      // find all villaIds matching pattern VID<number>
      const regex = /^VID(\d+)$/;
      const villas = await Villa.find({ villaId: { $regex: regex } }).select('villaId').lean();

      const existingNumbers = new Set();
      villas.forEach(v => {
        const match = v.villaId && v.villaId.match(regex);
        if (match && match[1]) {
          existingNumbers.add(parseInt(match[1], 10));
        }
      });

      // find smallest available number starting from 1
      let next = 1;
      while (existingNumbers.has(next)) next++;

      // format as 3 digits (minimum) - VID001, VID012, VID123, etc.
      const formatted = String(next).padStart(3, '0');
      villaId = `VID${formatted}`;
    } else {
      // if provided, ensure uniqueness
      const exists = await Villa.findOne({ villaId });
      if (exists) {
        return res.status(409).json({ message: 'villaId already exists' });
      }
    }

    // Build villa base price object
    const basePriceData = {};
    if (villaBasePrice) {
      if (villaBasePrice.withAC !== undefined && villaBasePrice.withAC !== null && villaBasePrice.withAC !== '') {
        basePriceData.withAC = Number(villaBasePrice.withAC);
      }
      if (villaBasePrice.withoutAC !== undefined && villaBasePrice.withoutAC !== null && villaBasePrice.withoutAC !== '') {
        basePriceData.withoutAC = Number(villaBasePrice.withoutAC);
      }
    }

    const newVilla = new Villa({
      villaId,
      villaName,
      description: description || '',
      villaLocation: villaLocation || '',
      hasAC: hasAC !== undefined ? hasAC : false,
      villaBasePrice: Object.keys(basePriceData).length > 0 ? basePriceData : undefined,
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
