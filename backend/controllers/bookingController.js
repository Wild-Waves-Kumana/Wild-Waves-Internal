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
      contactNumber,
      selectedDates
    } = req.body;

    if (!bookingId || !email || !contactNumber) {
      return res.status(400).json({ message: "Booking ID, email and contact number are required" });
    }

    if (!selectedDates || selectedDates.length === 0) {
      return res.status(400).json({ message: "At least one date must be selected" });
    }

    // Check if bookingId already exists
    const existing = await Booking.findOne({ bookingId });
    if (existing) {
      return res.status(409).json({ message: "Booking ID already exists" });
    }

    // Convert selected dates to Date objects and sort them
    const dates = selectedDates.map(date => new Date(date)).sort((a, b) => a - b);
    
    // Get first date as check-in and last date as check-out
    const checkinDate = dates[0];
    const checkoutDate = dates[dates.length - 1];

    const booking = new Booking({
      bookingId,
      email,
      contactNumber,
      selectedDates: dates,
      checkinDate,
      checkoutDate
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (err) {
    console.error("getAllBookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.status(200).json(booking);
  } catch (err) {
    console.error("getBookingById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
