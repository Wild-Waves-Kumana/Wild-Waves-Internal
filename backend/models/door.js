import mongoose from 'mongoose';

const doorSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  roomname: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ON', 'OFF'], default: 'ON' }
});

export default mongoose.model('Door', doorSchema);
