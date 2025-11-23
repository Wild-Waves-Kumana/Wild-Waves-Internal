import express from 'express';
import { 
  getNextBookingId, 
  createBooking,
  getBookingByBookingId // added
} from '../controllers/bookingController.js';

const router = express.Router();

// Get next booking ID
router.get('/next-id', getNextBookingId);

// Create new booking
router.post('/create', createBooking);

// Get booking by bookingId
router.get('/id/:bookingId', getBookingByBookingId);


export default router;