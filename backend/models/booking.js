import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  selectedDates: [{ type: Date }], // Array to store multiple dates
});

export default mongoose.model("Booking", bookingSchema);
