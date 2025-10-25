import Room from "../models/room.js";
import Villa from "../models/villa.js";
import Company from "../models/company.js";

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const {
      roomName,
      roomId,        // optional, unique if provided
      type,          // optional: "bedroom", "living room", ...
      bedroomType,   // optional: "single","double",...
      amenities,     // optional: array or comma-separated string
      capacity,      // optional: number
      status,        // optional: "available","occupied","maintenance"
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

    // If roomId provided ensure uniqueness
    if (roomId) {
      const existing = await Room.findOne({ roomId });
      if (existing) {
        return res.status(409).json({ message: "roomId already exists" });
      }
    }

    // Generate a roomId if not provided (villa.villaId preferred, fallback to villa._id)
    const generatedRoomId = roomId || `${villa.villaId || villa._id}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Normalize amenities to array
    let amenitiesArray = [];
    if (Array.isArray(amenities)) amenitiesArray = amenities;
    else if (typeof amenities === "string" && amenities.trim() !== "") {
      amenitiesArray = amenities.split(",").map(a => a.trim()).filter(Boolean);
    }

    const room = new Room({
      roomName,
      roomId: generatedRoomId,
      type,
      bedroomType,
      amenities: amenitiesArray,
      capacity: capacity !== undefined ? Number(capacity) : undefined,
      status,
      villaId,
      companyId: villa.companyId,
    });

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