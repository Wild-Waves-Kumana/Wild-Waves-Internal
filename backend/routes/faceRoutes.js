import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { registerFaces } from '../controllers/faceController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Expect field name 'images' with exactly 5 files
router.post('/register', authenticateToken, upload.array('images', 5), registerFaces);

export default router;
