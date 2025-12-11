import express from 'express';
import { getAllUsers, getUser, updateUser, adminUpdateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:userId', getUser);
router.put('/:userId', updateUser);
router.put('/:userId/administrator', adminUpdateUser);

export default router;