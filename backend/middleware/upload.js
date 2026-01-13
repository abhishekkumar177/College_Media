const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const {
    isCloudinaryConfigured,
    profilePictureStorage,
    postImageStorage
} = require('../config/cloudinary');

// Ensure uploads directory exists for local storage fallback
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local storage configuration (fallback)
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
    }
};

// Create upload middleware based on configuration
const createUploader = (storageType = 'profile') => {
    const useCloudinary = isCloudinaryConfigured();

    let storage;
    if (useCloudinary) {
        logger.info('Using Cloudinary storage');
        storage = storageType === 'post' ? postImageStorage : profilePictureStorage;
    } else {
        logger.warn('Cloudinary not configured, using local storage');
        storage = localStorage;
    }

    return multer({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: imageFilter
    });
};

// Profile picture uploader
const uploadProfilePicture = createUploader('profile');

// Post image uploader
const uploadPostImage = createUploader('post');

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            data: null,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            data: null,
            message: err.message
        });
    }
    next();
};

// Helper to get file URL after upload
const getUploadedFileUrl = (req, file) => {
    if (!file) return null;

    // Cloudinary returns path as the URL
    if (file.path && file.path.startsWith('http')) {
        return file.path;
    }

    // Local storage - construct URL
    return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
};

module.exports = {
    uploadProfilePicture,
    uploadPostImage,
    handleUploadError,
    getUploadedFileUrl,
    isCloudinaryConfigured
};
