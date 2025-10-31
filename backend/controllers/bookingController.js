import Booking from "../models/booking.js";

// Get next available booking ID in format BDDMMYYXXXX
export const getNextBookingId = async (req, res) => {
  try {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
    
    const datePrefix = `B${day}${month}${year}`;
    
    // Find all bookings with this date prefix
    const regex = new RegExp(`^${datePrefix}(\\d{4})$`);
    const bookings = await Booking.find({ bookingId: { $regex: regex } })
      .select('bookingId')
      .lean();
    
    const existingNumbers = new Set();
    bookings.forEach(b => {
      const match = b.bookingId && b.bookingId.match(regex);
      if (match && match[1]) {
        existingNumbers.add(parseInt(match[1], 10));
      }
    });
    
    // Find smallest available number starting from 1
    let next = 1;
    while (existingNumbers.has(next)) next++;
    
    // Format as 4 digits (0001, 0002, ..., 9999)
    const formatted = String(next).padStart(4, '0');
    const bookingId = `${datePrefix}${formatted}`;
    
    res.status(200).json({ nextBookingId: bookingId });
  } catch (error) {
    console.error('getNextBookingId error:', error);
    res.status(500).json({ message: 'Failed to generate next bookingId' });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      bookingId,
      email,
      contactNumber
    } = req.body;

    if (!bookingId || !email || !contactNumber) {
      return res.status(400).json({ message: "Booking ID, email and contact number are required" });
    }

    // Check if bookingId already exists
    const existing = await Booking.findOne({ bookingId });
    if (existing) {
      return res.status(409).json({ message: "Booking ID already exists" });
    }

    const booking = new Booking({
      bookingId,
      email,
      contactNumber
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
