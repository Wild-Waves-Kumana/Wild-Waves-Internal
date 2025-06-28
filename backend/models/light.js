import mongoose from 'mongoose';

const lightSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  roomname: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ON', 'OFF'], default: 'ON' },
  brightness: { type: Number, default: 100 }, // Brightness level from 0 to 100
});

export default mongoose.model('Light', lightSchema);
