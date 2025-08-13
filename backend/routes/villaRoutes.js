import express from 'express';
import { createVilla , getVillas} from '../controllers/villaController.js';

const router = express.Router();

router.post('/create', createVilla);
router.get('/all', getVillas);

export default router;
