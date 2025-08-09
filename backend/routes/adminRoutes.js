import express from 'express';
import { getAllAdmins, getAdminById } from '../controllers/adminController.js';

const router = express.Router();

router.get('/all', getAllAdmins);
router.get('/:adminId', getAdminById); // Assuming you have a getAdminById function

export default router;
