import express from 'express';
import { loginUser,  registerUser, registerAdmin, checkUsername } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/check-username/:username', checkUsername);
router.post('/adminregister', registerAdmin );

export default router;
