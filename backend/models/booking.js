import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },

});
export default mongoose.model("Booking", bookingSchema);
