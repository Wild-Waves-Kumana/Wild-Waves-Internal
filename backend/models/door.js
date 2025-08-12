import mongoose from 'mongoose';

const doorSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  villaName: String,
  lockStatus: { type: Number, enum: [0, 1], default: 1 }, // 0 for unlocked, 1 for locked
  status: { type: String, enum: ['ON', 'OFF'], default: 'OFF' },
  access: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // <-- added
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
});

export default mongoose.model('Door', doorSchema);
