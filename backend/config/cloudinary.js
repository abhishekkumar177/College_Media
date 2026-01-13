const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
};

// Create storage engine for profile pictures
const profilePictureStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'college-media/profile-pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
        public_id: (req, file) => `profile_${req.userId}_${Date.now()}`
    }
});

// Create storage engine for post images
const postImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'college-media/posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
        public_id: (req, file) => `post_${req.userId}_${Date.now()}`
    }
});

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        if (!publicId) return null;
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`Cloudinary image deleted: ${publicId}`);
        return result;
    } catch (error) {
        logger.error('Cloudinary delete error:', error);
        throw error;
    }
};

// Extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary')) return null;
    try {
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/public_id.ext
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // Get everything after upload/vXXX/
        const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
        return publicId;
    } catch (error) {
        logger.error('Error extracting public ID:', error);
        return null;
    }
};

module.exports = {
    cloudinary,
    isCloudinaryConfigured,
    profilePictureStorage,
    postImageStorage,
    deleteImage,
    getPublicIdFromUrl
};
