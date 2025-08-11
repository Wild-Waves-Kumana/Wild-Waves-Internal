import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  villaId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "company", required: true }, // <-- add this line
});

const Room = mongoose.model("Room", roomSchema);

export default Room;