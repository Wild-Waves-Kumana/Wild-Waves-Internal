import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  
  
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true,  default: 'user' },
  access: { type: Boolean, default: true },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }], // <-- Array of Room ObjectIds 
  checkinDate: { type: Date, required: true },
  checkoutDate: { type: Date, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  

}, { timestamps: true });

export default mongoose.model('User', userSchema);
