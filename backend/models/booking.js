import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  // Booking ID
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Booking Dates Section
  bookingDates: {
    dates: [{
      type: Date
    }],
    checkInDate: {
      type: Date,
      required: true
    },
    checkOutDate: {
      type: Date,
      required: true
    },
    nights: {
      type: Number,
      required: true,
      min: 0
    }
  },

  // Room Selection Section
  roomSelection: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    villaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Villa',
      required: true
    },
    acStatus: {
      type: Number, // 1 for AC, 0 for Non-AC
      enum: [0, 1],
      default: null
    },
    rooms: [{
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
      },
      roomName: {
        type: String,
        required: true
      },
      capacity: {
        type: Number,
        default: 0
      }
    }]
  },

  // Prices Section
  prices: {
    villaPrice: {
      type: Number,
      required: true,
      default: 0
    },
    roomPrices: [{
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
      },
      roomName: String,
      price: {
        type: Number,
        default: 0
      }
    }],
    nights: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    }
  },

  // Customer Section
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    identification: {
      nic: {
        type: String,
        default: ''
      },
      passport: {
        type: String,
        default: ''
      }
    },
    passengers: {
      adults: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      children: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      }
    }
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },

  // Raw booking data (for reference)
  rawBookingData: {
    type: mongoose.Schema.Types.Mixed
  }

}, { 
  timestamps: true 
});

// Indexes for better query performance
bookingSchema.index({ 'bookingDates.checkInDate': 1, 'bookingDates.checkOutDate': 1 });
bookingSchema.index({ 'roomSelection.companyId': 1 });
bookingSchema.index({ 'customer.email': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
