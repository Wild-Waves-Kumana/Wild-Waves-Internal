import mongoose from 'mongoose';

const airConditionerSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  temperaturelevel: { type: Number, default: 24 },
  mode: { type: String, enum: ['No Mode', 'Cool', 'Heat', 'Fan', 'Dry'], default: 'No Mode' },
  fanSpeed: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  access: { type: Boolean, default: true },
  status: { type: Boolean, default: false },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // <-- added
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
});

export default mongoose.model('AirConditioner', airConditionerSchema);
