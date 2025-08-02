import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyId: { type: String, required: true, unique: true }
});

export default mongoose.model('Company', companySchema);