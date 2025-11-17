import express from 'express';
import {
  uploadFile,
  deleteFile,
  getFileInfo,
} from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/upload
// Upload file to Cloudinary
// Form-data: file (attached file)
// Returns: fileUrl, fileName, fileType
router.post('/', upload.single('file'), uploadFile);

// DELETE /api/upload
// Delete file from Cloudinary
// Body: { publicId }
router.delete('/', deleteFile);

// GET /api/upload/:publicId
// Get file info from Cloudinary
router.get('/:publicId', getFileInfo);

export default router;
