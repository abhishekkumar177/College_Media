const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

/* ===============================
   UPLOAD DIRECTORY SETUP
================================ */
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===============================
   MULTER STORAGE (DISK + STREAM SAFE)
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

/* ===============================
   FILE FILTER
================================ */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const isValid =
    allowedTypes.includes(file.mimetype) &&
    /\.(pdf|doc|docx)$/i.test(file.originalname);

  if (!isValid) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type'));
  }

  cb(null, true);
};

/* ===============================
   MULTER CONFIG
================================ */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 🔼 Increased to 20MB
    files: 1
  }
});

/* ===============================
   UPLOAD ROUTE
================================ */
// @route   POST /api/upload
// @access  Private
router.post('/', protect, (req, res) => {
  upload.single('file')(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'File too large. Max size is 20MB'
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed'
      });
    }

    if (err) {
      return res.status(500).json({
        success: false,
        message: 'File processing error'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/uploads/${req.file.filename}`
      }
    });
  });
});

module.exports = router;
