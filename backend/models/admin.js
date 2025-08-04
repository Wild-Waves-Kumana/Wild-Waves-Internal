import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
});

export default mongoose.model('Admin', adminSchema);
