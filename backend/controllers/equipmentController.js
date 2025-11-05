import Door from '../models/door.js';
import Light from '../models/light.js';
import AirConditioner from '../models/airconditioner.js';
import Admin from '../models/admin.js';
import Company from '../models/company.js';
import Room from '../models/room.js';
import Villa from '../models/villa.js';
import mqttService from '../config/mqtt.js';

// Helper to generate unique itemCode based on category, finding the first available number
const generateUniqueItemCode = async (category) => {
  const prefixes = {
    "Doors": "DR",
    "Lights": "LT",
    "Air Conditioner": "AC",
  };
  const prefix = prefixes[category] || "E";

  // Check ALL collections for existing codes with this prefix
  const regex = new RegExp(`^${prefix}(\\d{4})$`);
  
  // Get existing codes from ALL collections (doors, lights, ACs)
  const [doorCodes, lightCodes, acCodes] = await Promise.all([
    Door.find({ itemCode: { $regex: regex } })
      .select("itemCode")
      .lean(),
    Light.find({ itemCode: { $regex: regex } })
      .select("itemCode")
      .lean(),
    AirConditioner.find({ itemCode: { $regex: regex } })
      .select("itemCode")
      .lean(),
  ]);

  // Combine all codes from all collections and extract numbers
  const allCodes = [...doorCodes, ...lightCodes, ...acCodes];
  const existingNumbers = new Set();

  // Extract all numeric parts and store in Set for fast lookup
  allCodes.forEach((item) => {
    const match = item.itemCode.match(regex);
    if (match && match[1]) {
      const number = parseInt(match[1], 10);
      existingNumbers.add(number);
    }
  });

  // Find the first available number starting from 1
  let nextNumber = 1;
  while (existingNumbers.has(nextNumber)) {
    nextNumber++;
  }

  // Generate item code with the first available number (without hyphen)
  const itemCode = `${prefix}${String(nextNumber).padStart(4, "0")}`;
  
  return itemCode;
};

// helper ➜ ensure global uniqueness of itemCode across all equipment collections
const isItemCodeTaken = async (itemCode) => {
  const [inDoor, inLight, inAC] = await Promise.all([
    Door.exists({ itemCode }),
    Light.exists({ itemCode }),
    AirConditioner.exists({ itemCode }),
  ]);
  return !!(inDoor || inLight || inAC);
};

// Get next available item code for preview
export const getNextItemCode = async (req, res) => {
  try {
    const { category } = req.params;
    console.log("Received category:", category); // Debug log
    const nextItemCode = await generateUniqueItemCode(category);
    console.log("Generated item code:", nextItemCode); // Debug log
    res.json({ nextItemCode });
  } catch (err) {
    console.error("Error generating next item code:", err);
    res.status(500).json({ message: "Failed to generate next item code" });
  }
};

export const createEquipment = async (req, res) => {
  const { category, itemName, access, adminId, villaId, roomId } = req.body;

  try {
    // Generate unique itemCode based on category
    const itemCode = await generateUniqueItemCode(category);

    // Validate admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(400).json({ message: "Admin not found." });
    }
    const companyId = admin.companyId;

    // Validate villa exists
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(400).json({ message: "Villa not found." });
    }

    // Choose the proper collection
    let EquipmentModel, companyField;
    switch (category) {
      case "Doors":
        EquipmentModel = Door;
        companyField = "doors";
        break;
      case "Lights":
        EquipmentModel = Light;
        companyField = "lights";
        break;
      case "Air Conditioner":
        EquipmentModel = AirConditioner;
        companyField = "airconditioners";
        break;
      default:
        return res.status(400).json({ message: "Invalid category." });
    }

    // Create equipment data
    const baseEquipment = {
      itemName,
      itemCode,
      villaName: villa.villaName,
      access: Boolean(access),
      roomId,
      createdAdminId: adminId,
      companyId,
    };

    const newEquipment = new EquipmentModel(baseEquipment);
    await newEquipment.save();

    // Update Room collection
    if (roomId) {
      let updateField = {};
      if (category === "Doors")
        updateField = { $push: { doors: newEquipment._id } };
      if (category === "Lights")
        updateField = { $push: { lights: newEquipment._id } };
      if (category === "Air Conditioner")
        updateField = { $push: { airConditioners: newEquipment._id } };

      if (Object.keys(updateField).length > 0) {
        await Room.findByIdAndUpdate(roomId, updateField);
      }
    }

    // Update Company collection
    if (companyField) {
      await Company.findByIdAndUpdate(companyId, {
        $addToSet: { [companyField]: newEquipment._id },
      });
    }

    res.status(201).json({
      message: `${category} item created successfully with code ${itemCode}`,
      equipment: newEquipment,
    });
  } catch (err) {
    console.error("Equipment creation error:", err);
    res.status(500).json({ message: "Server error while creating equipment." });
  }
};

//display doors
export const displaydoors = async (req, res) => {
  try {
    const doors = await Door.find().populate("roomId", "roomName");
    res.json(doors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doors" });
  }
};

//display lights
export const displaylights = async (req, res) => {
  try {
    const lights = await Light.find().populate("roomId", "roomName");
    res.json(lights);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch lights" });
  }
};

//display ACs
export const displayACs = async (req, res) => {
  try {
    const airconditioners = await AirConditioner.find().populate(
      "roomId",
      "roomName"
    );
    res.json(airconditioners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch airconditioners" });
  }
};

// Helper function
function constrain(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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
      access,
    } = req.body;

    // Check if itemCode is being updated and ensure it's unique
    if (itemCode) {
      const existing = await AirConditioner.findById(acId);
      if (existing && existing.itemCode !== itemCode) {
        if (await isItemCodeTaken(itemCode)) {
          return res.status(400).json({ message: "Item Code Already Used!" });
        }
      }
    }

    // Get current AC data
    const currentAC = await AirConditioner.findById(acId);
    if (!currentAC) {
      return res.status(404).json({ message: "Air Conditioner not found" });
    }

    // Build update object
    const updateFields = {};
    if (itemName !== undefined) updateFields.itemName = itemName;
    if (itemCode !== undefined) updateFields.itemCode = itemCode;
    if (access !== undefined) updateFields.access = access;

    // Temperature validation and update
    if (temperaturelevel !== undefined && temperaturelevel !== null) {
      updateFields.temperaturelevel = constrain(temperaturelevel, 16, 30);
    }

    // Mode validation and update
    const validModes = ["Cool", "Heat", "Fan", "Dry", "Auto"];
    if (mode !== undefined) {
      if (validModes.includes(mode)) {
        updateFields.mode = mode;
      } else {
        return res.status(400).json({
          message: "Invalid mode. Must be: Cool, Heat, Fan, Dry, or Auto",
        });
      }
    }

    // Fan speed validation and update
    const validFanSpeeds = ["Low", "Medium", "High", "Auto"];
    if (fanSpeed !== undefined) {
      if (validFanSpeeds.includes(fanSpeed)) {
        updateFields.fanSpeed = fanSpeed;
      } else {
        return res.status(400).json({
          message: "Invalid fan speed. Must be: Low, Medium, High, or Auto",
        });
      }
    }

    // Status update
    if (status !== undefined) {
      updateFields.status = status;
    }

    // Update database
    const updatedAC = await AirConditioner.findByIdAndUpdate(
      acId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // Prepare values for MQTT
    const mqttItemCode = updatedAC.itemCode;
    const mqttStatus = updatedAC.status;
    const mqttTemperature = updatedAC.temperaturelevel;
    const mqttMode = updatedAC.mode;
    const mqttFanSpeed = updatedAC.fanSpeed;
    const mqttAccess = updatedAC.access;

    // Publish to MQTT with all AC parameters
    await mqttService.publishACControl(
      acId,
      mqttItemCode,
      mqttStatus,
      mqttTemperature,
      mqttMode,
      mqttFanSpeed,
      mqttAccess
    );

    console.log(
      `AC ${acId} (${mqttItemCode}) updated - Status: ${mqttStatus}, Temp: ${mqttTemperature}°C, Mode: ${mqttMode}, Fan: ${mqttFanSpeed}`
    );

    res.json({
      message: "Air Conditioner updated successfully",
      airConditioner: updatedAC,
    });
  } catch (err) {
    console.error("Error updating air conditioner:", err);
    res.status(500).json({
      message: "Server error while updating air conditioner",
    });
  }
};

//update Door details
export const updateDoor = async (req, res) => {
  try {
    const { doorId } = req.params;
    let { itemName, itemCode, lockStatus, status, access } = req.body;

    // Get the current door to check if lockStatus is changing
    const currentDoor = await Door.findById(doorId).populate('roomId', 'roomName');
    if (!currentDoor) {
      return res.status(404).json({ message: 'Door not found' });
    }

    // Check if itemCode is being updated and ensure it's unique
    if (itemCode) {
      if (currentDoor.itemCode !== itemCode) {
        if (await isItemCodeTaken(itemCode)) {
          return res.status(400).json({ message: "Item Code Already Used!" });
        }
      }
    }

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
    ).populate('roomId', 'roomName');

    if (!updatedDoor) {
      return res.status(404).json({ message: 'Door not found' });
    }

    // Check if lockStatus changed and send MQTT notification
    const lockStatusChanged = lockStatus !== undefined && currentDoor.lockStatus !== lockStatus;
    console.log(`Door update debug - lockStatusChanged: ${lockStatusChanged}, MQTT connected: ${mqttService.isConnected}`);
    console.log(`Current lockStatus: ${currentDoor.lockStatus}, New lockStatus: ${lockStatus}`);
    
    if (lockStatusChanged) {
      if (mqttService.isConnected) {
        try {
          await mqttService.publishDoorLock(
            doorId,
            lockStatus,
            updatedDoor.itemName || 'Unknown Door',
            updatedDoor.roomId?.roomName || 'Unknown Room'
          );
          console.log(`✅ MQTT notification sent for door ${doorId}: lockStatus=${lockStatus}`);
        } catch (mqttError) {
          console.error('❌ Failed to send MQTT notification for door lock:', mqttError);
          // Don't fail the request if MQTT fails
        }
      } else {
        console.warn('⚠️ MQTT service not connected - door lock change not sent to Raspberry Pi');
      }
    } else {
      console.log('ℹ️ No lock status change detected - MQTT notification skipped');
    }

    res.json({ message: "Door updated successfully", door: updatedDoor });
  } catch (err) {
    console.error('Door update error:', err);
    res.status(500).json({ message: 'Server error while updating door' });
  }
};

//Update Light details
export const updateLight = async (req, res) => {
  try {
    const { lightId } = req.params;
    const { itemName, itemCode, brightness, status, access } = req.body;

    // Check if itemCode is being updated and ensure it's unique
    if (itemCode) {
      const existing = await Light.findById(lightId);
      if (existing && existing.itemCode !== itemCode) {
        if (await isItemCodeTaken(itemCode)) {
          return res.status(400).json({ message: "Item Code Already Used!" });
        }
      }
    }

    // Get current light data
    const currentLight = await Light.findById(lightId);
    if (!currentLight) {
      return res.status(404).json({ message: "Light not found" });
    }

    // Build update object
    const updateFields = {};
    if (itemName !== undefined) updateFields.itemName = itemName;
    if (itemCode !== undefined) updateFields.itemCode = itemCode;
    if (access !== undefined) updateFields.access = access;

    // Handle brightness - NEVER auto-change status based on brightness
    if (brightness !== undefined && brightness !== null) {
      updateFields.brightness = constrain(brightness, 0, 100);
    }

    // Handle status - ONLY changes when explicitly set
    if (status !== undefined) {
      updateFields.status = status;
    }

    // Update database
    const updatedLight = await Light.findByIdAndUpdate(
      lightId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // Prepare values for MQTT
    const mqttItemCode = updatedLight.itemCode;
    const mqttStatus = updatedLight.status;
    const mqttBrightness = updatedLight.brightness;
    const mqttAccess = updatedLight.access;

    // Publish to MQTT with itemCode
    await mqttService.publishLightControl(
      lightId,
      mqttItemCode, // Include itemCode
      mqttStatus,
      mqttBrightness,
      mqttAccess
    );

    console.log(
      `Light ${lightId} (${mqttItemCode}) updated - Status: ${mqttStatus}, Brightness: ${mqttBrightness}%`
    );

    res.json({
      message: "Light updated successfully",
      light: updatedLight,
    });
  } catch (err) {
    console.error("Error updating light:", err);
    res.status(500).json({ message: "Server error while updating light" });
  }
};

