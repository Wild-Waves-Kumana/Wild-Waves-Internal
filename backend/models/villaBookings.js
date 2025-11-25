import mongoose from 'mongoose';

const villaBookingsSchema = new mongoose.Schema({
  villa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'villa',
    required: true
  },
  villaName: {
    type: String,
    required: true
  },
  villaID: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
    required: true
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  bookingDates: [{
    type: Date,
    required: true
  }]
}, {
  timestamps: true
});

// Index for faster queries
villaBookingsSchema.index({ villa: 1 });
villaBookingsSchema.index({ villaID: 1 });
villaBookingsSchema.index({ bookingDates: 1 });

export default mongoose.model('VillaBookings', villaBookingsSchema);