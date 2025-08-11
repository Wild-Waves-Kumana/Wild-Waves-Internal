import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  villaName: { type: String, required: true },
  villaId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true,  default: 'user' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  doors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Door' }],
  lights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Light' }],
  airConditioners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AirConditioner' }],
});

export default mongoose.model('User', userSchema);
