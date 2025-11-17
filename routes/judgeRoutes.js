import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getVerdict, submitArgument } from '../controllers/judgeController.js';

const router = express.Router();

// All judge routes require authentication
router.use(protect);

// POST /api/judge/:caseId/verdict  -- generate initial verdict
router.post('/:caseId/verdict', getVerdict);

// POST /api/judge/:caseId/argument -- submit follow-up argument
router.post('/:caseId/argument', submitArgument);

export default router;
