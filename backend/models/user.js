import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: 'No Avatar' }, // <-- Add this line for avatar URL
  role: { type: String, required: true,  default: 'user' },
  access: { type: Boolean, default: true },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }], // <-- Array of Room ObjectIds 
  totalFoodPrice: { type: Number, default: 0 },
  checkinDate: { type: Date, required: true },
  checkoutDate: { type: Date, required: true },
  faceRegistration: { type: Boolean, default: false },
  villaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' }, // <-- Add this line for villa reference
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // <-- added
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

}, { timestamps: true });

export default mongoose.model('User', userSchema);
