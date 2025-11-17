import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

// CONTROLLER: Upload file to Cloudinary
export const uploadFile = async (req, res) => {
  console.log("Upload request received:", req.file);
  try {
    // CHECK: Is file attached?
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a file',
      });
    }

    // GET: File path from multer
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;

    // UPLOAD: File to Cloudinary
    // Simple upload without folder to avoid signature issues
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });

    // DELETE: Temporary file from server after upload
    fs.unlinkSync(filePath);

    // RESPONSE: Send back file info
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl: result.secure_url, // HTTPS URL
        fileName: fileName,
        fileType: fileType,
        fileSize: req.file.size,
        cloudinaryId: result.public_id, // For deletion later if needed
      },
    });
  } catch (error) {
    // CLEANUP: Delete temp file if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message,
    });
  }
};

// CONTROLLER: Delete file from Cloudinary
export const deleteFile = async (req, res) => {
  try {
    // GET: Public ID from request
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide publicId',
      });
    }

    // DELETE: File from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message,
    });
  }
};

// CONTROLLER: Get file info
export const getFileInfo = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide publicId',
      });
    }

    // GET: File info from Cloudinary
    const result = await cloudinary.api.resource(publicId);

    res.status(200).json({
      success: true,
      message: 'File info retrieved',
      data: {
        fileUrl: result.secure_url,
        fileSize: result.bytes,
        uploadedAt: result.created_at,
        format: result.format,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get file info',
      error: error.message,
    });
  }
};
