import Room from "../models/room.js";
import Villa from "../models/villa.js";
import Company from "../models/company.js";

// New: return next available roomId for a villa (RIDXXXYYY format)
export const getNextRoomId = async (req, res) => {
  try {
    const { villaId } = req.params;

    // Verify villa exists
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    // Extract numeric part from villaId (e.g., VID001 -> 001)
    const villaIdMatch = villa.villaId.match(/VID(\d+)/);
    if (!villaIdMatch) {
      return res.status(400).json({ message: "Invalid villa ID format" });
    }
    const villaNumber = villaIdMatch[1]; // e.g., "001"

    // Find all rooms for this villa with RIDXXXYYY pattern
    const regex = new RegExp(`^RID${villaNumber}(\\d+)$`);
    const rooms = await Room.find({ villaId, roomId: { $regex: regex } }).select('roomId').lean();

    const existingNumbers = new Set();
    rooms.forEach(r => {
      const match = r.roomId && r.roomId.match(regex);
      if (match && match[1]) {
        existingNumbers.add(parseInt(match[1], 10));
      }
    });

    // Find smallest available number starting from 1
    let next = 1;
    while (existingNumbers.has(next)) next++;

    // Format as 2 digits minimum (01, 02, ..., 99, 100, ...)
    const formatted = String(next).padStart(2, '0');
    const roomId = `RID${villaNumber}${formatted}`;

    res.status(200).json({ nextRoomId: roomId });
  } catch (error) {
    console.error('getNextRoomId error:', error);
    res.status(500).json({ message: 'Failed to generate next roomId' });
  }
};

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const {
      roomName,
      roomId,
      type,
      bedroomType,
      amenities,
      capacity,
      status,
      villaId
    } = req.body;

    if (!roomName || !villaId) {
      return res.status(400).json({ message: "roomName and villaId are required" });
    }

    // Verify villa exists and get companyId
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    let generatedRoomId = roomId;

    // If roomId not provided, generate RIDXXXYYY format
    if (!generatedRoomId) {
      const villaIdMatch = villa.villaId.match(/VID(\d+)/);
      if (!villaIdMatch) {
        return res.status(400).json({ message: "Invalid villa ID format" });
      }
      const villaNumber = villaIdMatch[1];

      const regex = new RegExp(`^RID${villaNumber}(\\d+)$`);
      const rooms = await Room.find({ villaId, roomId: { $regex: regex } }).select('roomId').lean();

      const existingNumbers = new Set();
      rooms.forEach(r => {
        const match = r.roomId && r.roomId.match(regex);
        if (match && match[1]) {
          existingNumbers.add(parseInt(match[1], 10));
        }
      });

      let next = 1;
      while (existingNumbers.has(next)) next++;

      const formatted = String(next).padStart(2, '0');
      generatedRoomId = `RID${villaNumber}${formatted}`;
    } else {
      // If roomId provided ensure uniqueness
      const existing = await Room.findOne({ roomId: generatedRoomId });
      if (existing) {
        return res.status(409).json({ message: "roomId already exists" });
      }
    }

    // Normalize amenities to array
    let amenitiesArray = [];
    if (Array.isArray(amenities)) amenitiesArray = amenities;
    else if (typeof amenities === "string" && amenities.trim() !== "") {
      amenitiesArray = amenities.split(",").map(a => a.trim()).filter(Boolean);
    }

    // Build room data - only include bedroom fields if type is bedroom
    const roomData = {
      roomName,
      roomId: generatedRoomId,
      type,
      amenities: amenitiesArray,
      status: status || 'available',
      villaId,
      companyId: villa.companyId,
    };

    // Only add bedroom-specific fields if type is bedroom AND they have values
    if (type === 'bedroom') {
      if (bedroomType && bedroomType.trim() !== '') {
        roomData.bedroomType = bedroomType;
      }
      if (capacity !== undefined && capacity !== null && capacity !== '') {
        roomData.capacity = Number(capacity);
      }
    }
    // If type is not bedroom, explicitly leave out bedroomType and capacity
    // Mongoose will use schema defaults or undefined

    const room = new Room(roomData);
    await room.save();

    // Add room._id to villa's rooms array
    await Villa.findByIdAndUpdate(
      villaId,
      { $addToSet: { rooms: room._id } },
      { new: true }
    );

    // Add room._id to company's rooms array
    await Company.findByIdAndUpdate(
      villa.companyId,
      { $addToSet: { rooms: room._id } },
      { new: true }
    );

    res.status(201).json(room);
  } catch (err) {
    console.error("createRoom error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getRoomsByUser =  async (req, res) => {
  const rooms = await Room.find({ villaId: req.params.userId });
  res.json(rooms);
};