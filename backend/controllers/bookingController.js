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

