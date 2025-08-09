import Door from '../models/door.js';
import Light from '../models/light.js';
import AirConditioner from '../models/airconditioner.js';
import User from '../models/user.js';
import Admin from '../models/admin.js';
import Company from '../models/company.js';

// helper ➜ ensure global uniqueness of itemCode
const isItemCodeTaken = async (itemCode) => {
  const inDoor = await Door.exists({ itemCode });
  const inLight = await Light.exists({ itemCode });
  const inAC   = await AirConditioner.exists({ itemCode });
  return inDoor || inLight || inAC;
};

export const createEquipment = async (req, res) => {
  const { category, itemName, itemCode, assignedUser, access, adminId } = req.body;

  try {
    // 1️⃣ Validate itemCode uniqueness
    if (await isItemCodeTaken(itemCode)) {
      return res.status(400).json({ message: 'Item Code Already Used !' });
    }

    // 2️⃣ Validate assigned user exists and get roomname
    const user = await User.findById(assignedUser);
    if (!user) {
      return res.status(400).json({ message: 'Assigned user does not exist.' });
    }

    // 2.5️⃣ Fetch admin to get companyId
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found.' });
    }
    const companyId = admin.companyId;

    // 3️⃣ Choose the proper collection
    let EquipmentModel;
    switch (category) {
      case 'Doors':               EquipmentModel = Door;              break;
      case 'Lights':              EquipmentModel = Light;             break;
      case 'Air Conditioner':     EquipmentModel = AirConditioner;    break;
      default:
        return res.status(400).json({ message: 'Invalid category.' });
    }

    // 4️⃣ Save document (add companyId)
    const newEquipment = new EquipmentModel({
      itemName,
      itemCode,
      roomname: user.roomname,
      assignedUser: user._id,
      access,
      createdAdminId: adminId,
      companyId // <-- add companyId from admin
    });

    await newEquipment.save();

    // Optionally, ensure user has the correct companyId (if not already set)
    if (!user.companyId || user.companyId.toString() !== companyId.toString()) {
      user.companyId = companyId;
      await user.save();
    }

    // Push equipment _id to user's array
    if (category === 'Doors') {
      await User.findByIdAndUpdate(
        user._id,
        { $push: { doors: newEquipment._id } }
      );
      // Push to company's doors array
      await Company.findByIdAndUpdate(
        companyId,
        { $push: { doors: newEquipment._id } }
      );
    }
    if (category === 'Lights') {
      await User.findByIdAndUpdate(
        user._id,
        { $push: { lights: newEquipment._id } }
      );
      // Push to company's lights array
      await Company.findByIdAndUpdate(
        companyId,
        { $push: { lights: newEquipment._id } }
      );
    }
    if (category === 'Air Conditioner') {
      await User.findByIdAndUpdate(
        user._id,     
        { $push: { airConditioners: newEquipment._id } }
      );
      // Push to company's airconditioners array
      await Company.findByIdAndUpdate(
        companyId,
        { $push: { airconditioners: newEquipment._id } }
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
    const doors = await Door.find().populate('assignedUser', 'username');
    res.json(doors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doors' });
  }
};

//display ACs
export const displaylights = async (req, res) => {
  try {
    // Populate assignedUser with username
    const lights = await Light.find().populate('assignedUser', 'username');
    res.json(lights);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lights' });
  }
};


//display ACs
export const displayACs = async (req, res) => {
  try {
    // Populate assignedUser with username
    const airconditioners = await AirConditioner.find().populate('assignedUser', 'username');
    res.json(airconditioners);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch airconditioners' });
  }
};
