import mongoose from 'mongoose';

const villaSchema = new mongoose.Schema({
  villaId: { type: String, required: true, unique: true },
  villaName: { type: String, required: true },
  villaLocation: { type: String },
  hasAC: { type: Boolean, default: false },
  villaBasePrice: {
    withAC: { type: Number },
    withoutAC: { type: Number }
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }], 
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true },
}, { timestamps: true });

export default mongoose.model('villa', villaSchema);