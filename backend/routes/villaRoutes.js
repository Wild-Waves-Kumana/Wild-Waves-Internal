import express from 'express';
import { createVilla , getVillas, getVillasbyId} from '../controllers/villaController.js';

const router = express.Router();

router.post('/create', createVilla);
router.get('/all', getVillas);
router.get('/:villa_id', getVillasbyId); // Assuming you want to fetch a specific villa by ID

export default router;
