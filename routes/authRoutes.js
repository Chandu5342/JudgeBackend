import express from 'express';
import {
  register,
  login,
  verifyToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// PUBLIC ROUTES (No authentication needed)

// POST /api/auth/register
// Description: Create new lawyer account
// Body: { name, email, password, role, phone, barRegistration }
// Returns: JWT token + user info
router.post('/register', register);

// POST /api/auth/login
// Description: Login with email and password
// Body: { email, password }
// Returns: JWT token + user info
router.post('/login', login);

// PROTECTED ROUTES (Authentication required)

// GET /api/auth/verify
// Description: Verify if current JWT token is valid
// Headers: Authorization: Bearer <token>
// Returns: Current user info
router.get('/verify', protect, verifyToken);

export default router;
