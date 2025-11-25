import express from 'express';
import {  getAllVillaBookings, createOrUpdateVillaBooking, getVillaBookings } from '../controllers/villaBookingsController.js';

const router = express.Router();

router.get('/all', getAllVillaBookings);  // GET - Get all villa bookings (move before /:villaId)
router.post('/update', createOrUpdateVillaBooking); // POST - Create or update villa booking
router.get('/:villaId', getVillaBookings);  // GET - Get villa bookings by villa ID

export default router;