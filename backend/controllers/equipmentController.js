import Door from '../models/door.js';
import Light from '../models/light.js';
import AirConditioner from '../models/airconditioner.js';
import Admin from '../models/admin.js';
import Company from '../models/company.js';
import Room from '../models/room.js'; // Make sure this import is present
import Villa from '../models/villa.js'; // Import Villa model

// helper ➜ ensure global uniqueness of itemCode
const isItemCodeTaken = async (itemCode) => {
  const inDoor = await Door.exists({ itemCode });
  const inLight = await Light.exists({ itemCode });
  const inAC   = await AirConditioner.exists({ itemCode });
  return inDoor || inLight || inAC;
};

export const createEquipment = async (req, res) => {
  const { category, itemName, itemCode, access, adminId, villaId, roomId } = req.body;

  try {
    // 1️⃣ Validate itemCode uniqueness
    if (await isItemCodeTaken(itemCode)) {
      return res.status(400).json({ message: 'Item Code Already Used !' });
    }

    // 2.5️⃣ Fetch admin to get companyId
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found.' });
    }
    const companyId = admin.companyId;

    // Fetch the villa to get villaName
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(400).json({ message: 'Villa not found.' });
    }

    // 3️⃣ Choose the proper collection
    let EquipmentModel, companyField;
    switch (category) {
      case 'Doors':
        EquipmentModel = Door;
        companyField = 'doors';
        break;
      case 'Lights':
        EquipmentModel = Light;
        companyField = 'lights';
        break;
      case 'Air Conditioner':
        EquipmentModel = AirConditioner;
        companyField = 'airconditioners';
        break;
      default:
        return res.status(400).json({ message: 'Invalid category.' });
    }

    // 4️⃣ Save document (add companyId)
    const baseEquipment = {
      itemName,
      itemCode,
      villaName: villa.villaName,
      access: Boolean(access),
      roomId,
      createdAdminId: adminId,
      companyId
    };

    // Only assign user for Lights (if you want)
    // if (category === 'Lights') {
    //   baseEquipment.assignedUser = someUserId;
    // }

    // Do NOT set assignedUser for Doors or Air Conditioner

    const newEquipment = new EquipmentModel(baseEquipment);

    await newEquipment.save();

    // --- Update Room collection ---
    if (req.body.roomId) {
      let updateField = {};
      if (category === "Doors") updateField = { $push: { doors: newEquipment._id } };
      if (category === "Lights") updateField = { $push: { lights: newEquipment._id } };
      if (category === "Air Conditioner") updateField = { $push: { airConditioners: newEquipment._id } };

      if (Object.keys(updateField).length > 0) {
        await Room.findByIdAndUpdate(req.body.roomId, updateField);
      }
    }

    // --- Update Company collection ---
    if (companyField) {
      await Company.findByIdAndUpdate(
        companyId,
        { $addToSet: { [companyField]: newEquipment._id } }
      );
    }

    res.status(201).json({ message: `${category} item created.` });
  } catch (err) {
    console.error('Equipment creation error:', err);
    res.status(500).json({ message: 'Server error while creating equipment.' });
  }
};

//display doors
export const displaydoors = async (req, res) => {
  try {
    // Populate assignedUser with username
    const doors = await Door.find()
    .populate('roomId', 'roomName');
    res.json(doors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doors' });
  }
};

//display ACs
export const displaylights = async (req, res) => {
  try {
    // Populate assignedUser with username
    const lights = await Light.find()
    .populate('roomId', 'roomName');
    res.json(lights);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lights' });
  }
};


//display ACs
export const displayACs = async (req, res) => {
  try {
    // Populate assignedUser with username
    const airconditioners = await AirConditioner.find()
    .populate('roomId', 'roomName');    
     res.json(airconditioners);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch airconditioners' });
  }
};


// Update Air Conditioner details
export const updateAirConditioner = async (req, res) => {
  try {
    const { acId } = req.params;
    const {
      itemName,
      itemCode,
      temperaturelevel,
      mode,
      fanSpeed,
      status,
      access
    } = req.body;

    // Build update object
    const updateFields = {};
    if (itemName) updateFields.itemName = itemName;
    if (itemCode) updateFields.itemCode = itemCode;
    if (temperaturelevel !== undefined) updateFields.temperaturelevel = temperaturelevel;
    if (mode) updateFields.mode = mode;
    if (fanSpeed) updateFields.fanSpeed = fanSpeed;
    if (status !== undefined) updateFields.status = status;   // <-- fix here
    if (access !== undefined) updateFields.access = access; 

    const updatedAC = await AirConditioner.findByIdAndUpdate(
      acId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedAC) {
      return res.status(404).json({ message: 'Air Conditioner not found' });
    }

    res.json({ message: 'Air Conditioner updated successfully', airConditioner: updatedAC });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating air conditioner' });
  }
};



//update Door details
export const updateDoor = async (req, res) => {
  try {
    const { doorId } = req.params;
    let {
      itemName,
      itemCode,
      lockStatus,
      status,
      access,
    } = req.body;

    // If access is being set to false, force status to false (OFF) and lockStatus to false (Locked)
    if (access === false || access === "false") {
      status = false;
      lockStatus = false;
    }

    // Build update object
    const updateFields = {};
    if (itemName) updateFields.itemName = itemName;
    if (itemCode) updateFields.itemCode = itemCode;
    if (lockStatus !== undefined) updateFields.lockStatus = lockStatus;
    if (status !== undefined) updateFields.status = status;
    if (access !== undefined) updateFields.access = access;

    const updatedDoor = await Door.findByIdAndUpdate(
      doorId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedDoor) {
      return res.status(404).json({ message: 'Door not found' });
    }

    res.json({ message: 'Door updated successfully', door: updatedDoor });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating door' });
  }
};

//Update Light details
export const updateLight = async (req, res) => {
  try {
    const { lightId } = req.params;
    const {
      itemName,
      itemCode,
      brightness,
      status,
      access
    } = req.body;

    // Build update object
    const updateFields = {};
    if (itemName) updateFields.itemName = itemName;
    if (itemCode) updateFields.itemCode = itemCode;
    if (brightness !== undefined) updateFields.brightness = brightness;
    if (status !== undefined) updateFields.status = status;   // <-- fix here
    if (access !== undefined) updateFields.access = access;   // <-- fix here

    const updatedLight = await Light.findByIdAndUpdate(
      lightId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedLight) {
      return res.status(404).json({ message: 'Light not found' });
    }

    res.json({ message: 'Light updated successfully', light: updatedLight });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating light' });
  }
};
