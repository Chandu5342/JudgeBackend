import multer from 'multer';
import path from 'path';
import fs from 'fs';

// CREATE: Uploads folder if not exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// CONFIGURE: Where to store files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store in uploads/ folder
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Name: timestamp-originalname
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// CONFIGURE: File filter - only allow certain file types
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = [
    'application/pdf', // PDF
    'application/msword', // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'text/plain', // TXT
    'application/vnd.ms-excel', // XLS
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Only PDF, Word, Excel, and Text files are allowed. Received: ${file.mimetype}`
      ),
      false
    );
  }
};

// CREATE: Multer instance
// limits: maxFileSize 10MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
