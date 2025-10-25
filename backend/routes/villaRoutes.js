import express from 'express';
import { createVilla, getVillas, getVillasbyId, getNextVillaId } from '../controllers/villaController.js';

const router = express.Router();

router.get('/all', getVillas);
router.get('/next-id', getNextVillaId); // <-- Move this BEFORE /:villa_id
router.get('/:villa_id', getVillasbyId);
router.post('/create', createVilla);

export default router;
