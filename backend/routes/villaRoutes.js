import express from 'express';
import { createVilla } from '../controllers/villaController.js';

const router = express.Router();

router.post('/create', createVilla);

export default router;
