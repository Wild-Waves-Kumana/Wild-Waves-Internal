import express from 'express';
import { createEquipment, displaydoors } from '../controllers/equipmentController.js';

const router = express.Router();

router.post('/create', createEquipment);
router.get('/doors', displaydoors); // Add route to display doors   

export default router;
