import express from 'express';
import { createEquipment } from '../controllers/equipmentController.js';

const router = express.Router();

router.post('/create', createEquipment);

export default router;
