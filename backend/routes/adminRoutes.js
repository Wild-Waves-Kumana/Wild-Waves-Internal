import express from 'express';
import { getAllAdmins, getAdminById, updateAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.get('/all', getAllAdmins);
router.get('/:adminId', getAdminById); // Assuming you have a getAdminById function
router.put('/:adminId', updateAdmin); // Assuming you have an updateAdmin function  

export default router;
