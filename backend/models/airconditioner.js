import mongoose from 'mongoose';

const airConditionerSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  roomname: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ON', 'OFF'], default: 'ON' },
  temperaturelevel: { type: Number, default: 24 }, // Temperature level in Celsius
  mode: { type: String, enum: ['Cool', 'Heat', 'Fan', 'Dry'], default: 'Cool' }, // Mode of operation
  fanSpeed: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' } // Fan speed setting 
});

export default mongoose.model('AirConditioner', airConditionerSchema);
