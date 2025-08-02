import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  roomname: { type: String, required: true },
  roomid: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true,  default: 'user' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
});

export default mongoose.model('User', userSchema);
