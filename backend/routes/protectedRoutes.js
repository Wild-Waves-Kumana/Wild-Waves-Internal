// routes/protectedRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// Example protected route
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Welcome to your dashboard!',
    user: req.user, // This comes from the decoded JWT
  });
});

// routes/protectedRoutes.js
router.get('/admin-data', authenticateToken, (req, res) => {
  authenticateToken,
  authorizeRole('admin', 'superadmin'), // Only admins and superadmins
  res.json({
    message: 'Here is your protected admin data',
    user: req.user
  });
});


export default router;
