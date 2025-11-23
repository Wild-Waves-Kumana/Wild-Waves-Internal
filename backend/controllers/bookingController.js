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

// Create booking - saves copy of incoming booking data plus bookingId
export const createBooking = async (req, res) => {
  try {
    const {
      bookingId,
      dates,
      checkInDate,
      checkOutDate,
      nights,
      company,
      villa,
      selectedRooms,
      acStatus,
      customer,
      prices,
      bookingData
    } = req.body;

    // Validate required fields
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    if (!company) {
      return res.status(400).json({ message: 'Company selection is required' });
    }

    if (!villa) {
      return res.status(400).json({ message: 'Villa selection is required' });
    }

    if (!selectedRooms || selectedRooms.length === 0) {
      return res.status(400).json({ message: 'At least one room must be selected' });
    }

    if (!customer || !customer.name || !customer.email || !customer.contactNumber) {
      return res.status(400).json({ message: 'Customer details are incomplete' });
    }

    // Check if at least one identification is provided
    if (!customer.identification?.nic && !customer.identification?.passport) {
      return res.status(400).json({ message: 'Customer identification (NIC or Passport) is required' });
    }

    // Validate passenger count
    const adults = Number(customer.passengers?.adults) || 0;
    const children = Number(customer.passengers?.children) || 0;
    const totalPassengers = adults + children;

    if (totalPassengers === 0) {
      return res.status(400).json({ message: 'At least one passenger is required' });
    }

    // Check if booking ID already exists
    const existingBooking = await Booking.findOne({ bookingId });
    if (existingBooking) {
      return res.status(409).json({ message: 'Booking ID already exists. Please refresh and try again.' });
    }

    // Create new booking document
    const newBooking = new Booking({
      bookingId,
      
      // Booking Dates
      bookingDates: {
        dates: dates || [],
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        nights: nights || 0
      },

      // Room Selection
      roomSelection: {
        companyId: company,
        villaId: villa,
        acStatus: acStatus !== null && acStatus !== undefined ? Number(acStatus) : null,
        rooms: bookingData?.roomSelection?.rooms || []
      },

      // Prices
      prices: {
        villaPrice: prices?.villaPrice || 0,
        roomPrices: prices?.roomPrices || [],
        nights: prices?.nights || nights || 0,
        totalPrice: prices?.totalPrice || 0
      },

      // Customer (including passengers)
      customer: {
        name: customer.name,
        email: customer.email,
        contactNumber: customer.contactNumber,
        identification: {
          nic: customer.identification?.nic || '',
          passport: customer.identification?.passport || ''
        },
        passengers: {
          adults: adults,
          children: children
        }
      },

      // Status
      status: 'pending',
      paymentStatus: 'pending',

      // Store raw booking data for reference
      rawBookingData: bookingData || req.body
    });

    // Save to database
    const savedBooking = await newBooking.save();

    console.log('Booking created successfully:', savedBooking.bookingId);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        bookingId: savedBooking.bookingId,
        _id: savedBooking._id,
        companyId: savedBooking.roomSelection.companyId,
        checkInDate: savedBooking.bookingDates.checkInDate,
        checkOutDate: savedBooking.bookingDates.checkOutDate,
        nights: savedBooking.bookingDates.nights,
        totalPrice: savedBooking.prices.totalPrice,
        passengers: savedBooking.customer.passengers,
        status: savedBooking.status,
        paymentStatus: savedBooking.paymentStatus,
        createdAt: savedBooking.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Booking with this ID already exists' 
      });
    }

    res.status(500).json({ 
      message: 'Failed to create booking', 
      error: error.message 
    });
  }
};

// Get booking by booking ID (BDDMMYYXXXX format)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching booking with ID:', id);
    
    const booking = await Booking.findOne({ bookingId: id });

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    console.log('Booking found:', booking.bookingId);

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch booking', 
      error: error.message 
    });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('roomSelection.companyId', 'companyName companyId')
      .populate('roomSelection.villaId', 'villaName villaId villaLocation')
      .populate('roomSelection.rooms.roomId', 'roomName roomId type')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
};

// Get booking by MongoDB _id
export const getBookingByMongoId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('roomSelection.companyId', 'companyName companyId')
      .populate('roomSelection.villaId', 'villaName villaId villaLocation villaBasePrice')
      .populate('roomSelection.rooms.roomId', 'roomName roomId type capacity roomBasePrice')
      .lean();

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking by MongoDB ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch booking', 
      error: error.message 
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    // Validate status values
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const validPaymentStatuses = ['pending', 'partial', 'paid', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` 
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    console.log('Booking status updated:', booking.bookingId);

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update booking status', 
      error: error.message 
    });
  }
};


