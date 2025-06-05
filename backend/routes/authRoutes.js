import express from 'express';
import { loginUser,  registerUser, registerAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/adminregister', registerAdmin );

export default router;
