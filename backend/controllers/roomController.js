import User from "../models/user.js";
import Room from "../models/room.js";
import Company from "../models/company.js";

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { roomName, villaId } = req.body;
    if (!roomName || !villaId) {
      return res.status(400).json({ message: "roomName and villaId are required" });
    }

    // Fetch the user to get companyId
    const user = await User.findById(villaId);
    if (!user) {
      return res.status(404).json({ message: "User (villaId) not found" });
    }

    const room = new Room({
      roomName,
      villaId,
      companyId: user.companyId,
    });

    await room.save();

    // Add room._id to user's rooms array
    await User.findByIdAndUpdate(
      villaId,
      { $addToSet: { rooms: room._id } }, // $addToSet avoids duplicates
      { new: true }
    );

    // Add room._id to company's rooms array
    await Company.findByIdAndUpdate(
      user.companyId,
      { $addToSet: { rooms: room._id } },
      { new: true }
    );

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};