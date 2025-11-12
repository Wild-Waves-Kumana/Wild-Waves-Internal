import express from 'express';
import { 
  getNextBookingId, 
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingByMongoId,
  updateBookingStatus
} from '../controllers/bookingController.js';

const router = express.Router();

// Get next booking ID
router.get('/next-id', getNextBookingId);

// Create new booking
router.post('/create', createBooking);

// Get all bookings
router.get('/all', getAllBookings);

// Get booking by booking ID (BDDMMYYXXXX format)
router.get('/id/:id', getBookingById);

// Get booking by MongoDB _id
router.get('/:id', getBookingByMongoId);

// Update booking status
router.patch('/:id/status', updateBookingStatus);

export default router;