import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { registerFaces, deleteFaces } from '../controllers/faceController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Expect field name 'images' with exactly 5 files
router.post('/register', authenticateToken, upload.array('images', 5), registerFaces);

// DELETE /api/face/delete/:userId  (authorized)
router.delete('/delete/:userId', authenticateToken, deleteFaces);

export default router;
