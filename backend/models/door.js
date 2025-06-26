import mongoose from 'mongoose';

const doorSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  username: String,
  status: { type: String, enum: ['ON', 'OFF'], default: 'ON' }
});

export default mongoose.model('Door', doorSchema);
