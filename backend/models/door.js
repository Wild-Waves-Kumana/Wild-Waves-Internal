import mongoose from 'mongoose';

const doorSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  roomname: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ON', 'OFF'], default: 'ON' },
  access: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
});

export default mongoose.model('Door', doorSchema);
