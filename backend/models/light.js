import mongoose from 'mongoose';

const lightSchema = new mongoose.Schema({
  itemName: String,
  itemCode: { type: String, unique: true },
  brightness: { type: Number, default: 100 },
  access: { type: Boolean, default: true }, //true for Enabled, false for Disabled
  status: { type: Boolean, default: false }, //false for OFF, true for ON
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // <-- added
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
});

export default mongoose.model('Light', lightSchema);
