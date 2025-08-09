import express from 'express';
import { getAllUsers, getUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:userId', getUser);
router.put('/:userId', updateUser);

export default router;