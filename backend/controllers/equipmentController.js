import Door from '../models/door.js';
import Light from '../models/light.js';
import AirConditioner from '../models/airconditioner.js';
import User from '../models/user.js';

// helper ➜ ensure global uniqueness of itemCode
const isItemCodeTaken = async (itemCode) => {
  const inDoor = await Door.exists({ itemCode });
  const inLight = await Light.exists({ itemCode });
  const inAC   = await AirConditioner.exists({ itemCode });
  return inDoor || inLight || inAC;
};

export const createEquipment = async (req, res) => {
  const { category, itemName, itemCode, assignedTo, status } = req.body;

  try {
    // 1️⃣ Validate itemCode uniqueness
    if (await isItemCodeTaken(itemCode)) {
      return res.status(400).json({ message: 'itemCode must be unique across all equipment.' });
    }

    // 2️⃣ Validate assigned user exists and get roomname
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(400).json({ message: 'Assigned user does not exist.' });
    }

    // 3️⃣ Choose the proper collection
    let EquipmentModel;
    switch (category) {
      case 'Doors':               EquipmentModel = Door;              break;
      case 'Lights':              EquipmentModel = Light;             break;
      case 'Air Conditioner':     EquipmentModel = AirConditioner;    break;
      default:
        return res.status(400).json({ message: 'Invalid category.' });
    }

    // 4️⃣ Save document
    const newEquipment = new EquipmentModel({
      itemName,
      itemCode,
      roomname: user.roomname,         // use user's roomname
      assignedTo: user._id,            // store reference
      status,
    });

    await newEquipment.save();
    res.status(201).json({ message: `${category} item created.` });
  } catch (err) {
    console.error('Equipment creation error:', err);
    res.status(500).json({ message: 'Server error while creating equipment.' });
  }
};
