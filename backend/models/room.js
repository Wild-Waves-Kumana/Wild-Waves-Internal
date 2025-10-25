import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  roomId: { type: String, required: true, unique: true },
  type: { type: String, enum: ["bedroom", "living room", "kitchen", "bathroom", "other"], default: "other" },
  bedroomType: { type: String, enum: ["single", "double", "queen", "king", "suite"] },
  amenities: [{ type: String }],
  capacity: { type: Number, default: 0 },
  status: { type: String, enum: ["available", "occupied", "maintenance"], default: "available" },
  villaId: { type: mongoose.Schema.Types.ObjectId, ref: "villa", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "company", required: true },
  doors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Door" }],
  lights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Light" }],
  airConditioners: [{ type: mongoose.Schema.Types.ObjectId, ref: "AirConditioner" }],
});

const Room = mongoose.model("Room", roomSchema);

export default Room;