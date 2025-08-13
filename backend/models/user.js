import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  
  
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true,  default: 'user' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }], // <-- Array of Room ObjectIds
  
});

export default mongoose.model('User', userSchema);
