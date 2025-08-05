import mongoose from 'mongoose';

const airConditionerSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  roomname: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ON', 'OFF'], default: 'ON' },
  temperaturelevel: { type: Number, default: 24 },
  mode: { type: String, enum: ['Cool', 'Heat', 'Fan', 'Dry'], default: 'Cool' },
  fanSpeed: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  createdAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
});

export default mongoose.model('AirConditioner', airConditionerSchema);
