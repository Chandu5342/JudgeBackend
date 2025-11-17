import express from 'express';
import {
  createCase,
  joinCase,
  getMyCases,
  getCaseDetails,
  getPublicCases,
  addDocument,
  updateCaseStatus,
} from '../controllers/caseController.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication (protect middleware)
router.use(protect);

// POST /api/cases
// Create a new case (Lawyer A initiates)
// Body: { title, description, category, jurisdiction }
router.post('/', createCase);

// GET /api/cases
// Get all cases for current user (as Lawyer A or B)
router.get('/', getMyCases);

// GET /api/cases/public
// Get all cases for browsing (visible to authenticated users)
router.get('/public', getPublicCases);

// GET /api/cases/:caseId
// Get single case details
// Only Lawyer A or B can view
router.get('/:caseId', getCaseDetails);

// POST /api/cases/:caseId/join
// Join an existing case as Lawyer B
router.post('/:caseId/join', joinCase);

// POST /api/cases/:caseId/documents
// Add document to case
// Supports either JSON body with { documentName, documentUrl, documentType }
// or multipart/form-data with file field `file` (will be uploaded to Cloudinary)
router.post('/:caseId/documents', upload.single('file'), addDocument);

// PUT /api/cases/:caseId/status
// Update case status
// Body: { status: "draft" | "submitted" | "in_hearing" | "closed" }
// Only Lawyer A can update
router.put('/:caseId/status', updateCaseStatus);

export default router;
