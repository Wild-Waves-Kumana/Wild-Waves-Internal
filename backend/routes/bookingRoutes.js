import express from 'express';
import { getNextBookingId } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/next-id', getNextBookingId);
//router.post('/create', createBooking);

export default router;