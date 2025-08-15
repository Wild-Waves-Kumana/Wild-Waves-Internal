import Room from "../models/room.js";
import Villa from "../models/villa.js";
import Company from "../models/company.js";

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { roomName, villaId } = req.body;
    if (!roomName || !villaId) {
      return res.status(400).json({ message: "roomName and villaId are required" });
    }

    // Fetch the villa to get companyId
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    const room = new Room({
      roomName,
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