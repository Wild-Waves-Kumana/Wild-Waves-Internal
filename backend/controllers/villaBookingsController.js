import VillaBookings from '../models/villaBookings.js';
import Booking from '../models/booking.js';
import Villa from '../models/villa.js';

// Create or update villa booking entry
export const createOrUpdateVillaBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Fetch booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get villa ID from booking
    const villaId = booking.roomSelection?.villaId;
    if (!villaId) {
      return res.status(400).json({
        success: false,
        message: 'Villa ID not found in booking'
      });
    }

    // Fetch villa details
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: 'Villa not found'
      });
    }

    // Get company ID from booking
    const companyId = booking.roomSelection?.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID not found in booking'
      });
    }

    // Extract booking dates from booking (excluding checkout date)
    let bookingDates = booking.bookingDates?.dates || [];
    
    // If dates array is empty, generate dates from checkIn to checkOut (excluding checkOut)
    if (bookingDates.length === 0 && booking.bookingDates?.checkInDate && booking.bookingDates?.checkOutDate) {
      const checkIn = new Date(booking.bookingDates.checkInDate);
      const checkOut = new Date(booking.bookingDates.checkOutDate);
      
      bookingDates = [];
      const currentDate = new Date(checkIn);
      
      // Add dates from check-in to day before check-out
      while (currentDate < checkOut) {
        bookingDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // Filter out the checkout date if it exists in the dates array
      const checkOutDate = booking.bookingDates?.checkOutDate;
      if (checkOutDate) {
        bookingDates = bookingDates.filter(date => {
          const dateTime = new Date(date).getTime();
          const checkOutTime = new Date(checkOutDate).getTime();
          return dateTime < checkOutTime;
        });
      }
    }

    console.log('Booking dates to add (excluding checkout):', bookingDates);
    
    // Find existing villa booking entry or create new one
    let villaBooking = await VillaBookings.findOne({ villa: villaId });

    if (villaBooking) {
      // Update existing entry
      // Add booking ID if not already in array
      if (!villaBooking.bookings.includes(bookingId)) {
        villaBooking.bookings.push(bookingId);
      }

      // Add new booking dates to array (avoid duplicates, exclude checkout date)
      bookingDates.forEach(date => {
        const dateExists = villaBooking.bookingDates.some(
          existingDate => existingDate.getTime() === new Date(date).getTime()
        );
        if (!dateExists) {
          villaBooking.bookingDates.push(new Date(date));
        }
      });

      // Sort booking dates
      villaBooking.bookingDates.sort((a, b) => a.getTime() - b.getTime());

      await villaBooking.save();
    } else {
      // Create new villa booking entry
      villaBooking = new VillaBookings({
        villa: villaId,
        villaName: villa.villaName,
        villaID: villa.villaId,
        company: companyId,
        bookings: [bookingId],
        bookingDates: bookingDates.map(date => new Date(date)).sort((a, b) => a.getTime() - b.getTime())
      });

      await villaBooking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Villa booking updated successfully',
      data: villaBooking
    });

  } catch (error) {
    console.error('Error updating villa booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update villa booking',
      error: error.message
    });
  }
};

// Get villa bookings by villa ID
export const getVillaBookings = async (req, res) => {
  try {
    const { villaId } = req.params;

    const villaBooking = await VillaBookings.findOne({ villa: villaId })
      .populate('villa', 'villaName villaId villaLocation')
      .populate('company', 'companyName companyId')
      .populate({
        path: 'bookings',
        select: 'bookingId bookingDates customer status paymentStatus'
      });

    if (!villaBooking) {
      return res.status(404).json({
        success: false,
        message: 'No bookings found for this villa'
      });
    }

    res.status(200).json({
      success: true,
      data: villaBooking
    });

  } catch (error) {
    console.error('Error fetching villa bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch villa bookings',
      error: error.message
    });
  }
};

// Get all villa bookings
export const getAllVillaBookings = async (req, res) => {
  try {
    const villaBookings = await VillaBookings.find()
      .populate('villa', 'villaName villaId villaLocation')
      .populate('company', 'companyName companyId')
      .populate({
        path: 'bookings',
        select: 'bookingId bookingDates customer status paymentStatus'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: villaBookings.length,
      data: villaBookings
    });

  } catch (error) {
    console.error('Error fetching all villa bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch villa bookings',
      error: error.message
    });
  }
};