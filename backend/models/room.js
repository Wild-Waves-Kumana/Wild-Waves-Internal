import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  villaId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "company", required: true },
  doors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Door" }],
  lights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Light" }],
  airConditioners: [{ type: mongoose.Schema.Types.ObjectId, ref: "AirConditioner" }],
});

const Room = mongoose.model("Room", roomSchema);

export default Room;