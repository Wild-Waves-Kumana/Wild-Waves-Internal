import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyId: { type: String, required: true, unique: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

export default mongoose.model('Company', companySchema);