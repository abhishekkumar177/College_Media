const validator = require('validator');

/**
 * Validation utilities for common input patterns
 * Provides reusable validation functions across the application
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    return validator.isEmail(email, {
        allow_display_name: false,
        require_tld: true,
        allow_utf8_local_part: false,
    });
};

/**
 * Validate username format
 * Rules: 3-30 characters, alphanumeric with underscores/hyphens, no spaces
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid username
 */
const isValidUsername = (username) => {
    if (!username || typeof username !== 'string') return false;
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
};

/**
 * Validate password strength
 * Rules: Minimum 6 characters (can be enhanced for production)
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
const isValidPassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long' };
    }

    // Optional: Add more strict requirements for production
    // if (!/[A-Z]/.test(password)) {
    //   return { valid: false, message: 'Password must contain at least one uppercase letter' };
    // }
    // if (!/[a-z]/.test(password)) {
    //   return { valid: false, message: 'Password must contain at least one lowercase letter' };
    // }
    // if (!/[0-9]/.test(password)) {
    //   return { valid: false, message: 'Password must contain at least one number' };
    // }

    return { valid: true, message: 'Password is valid' };
};

/**
 * Validate name (first name, last name)
 * Rules: 1-50 characters, letters and spaces only
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name
 */
const isValidName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const nameRegex = /^[a-zA-Z\s]{1,50}$/;
    return nameRegex.test(name.trim());
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
const isValidURL = (url) => {
    if (!url || typeof url !== 'string') return false;
    return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_valid_protocol: true,
    });
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return validator.isMongoId(id);
};

/**
 * Validate phone number (international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    return validator.isMobilePhone(phone, 'any', { strictMode: false });
};

/**
 * Validate bio/description text
 * Rules: Max 500 characters
 * @param {string} bio - Bio text to validate
 * @returns {boolean} - True if valid bio
 */
const isValidBio = (bio) => {
    if (!bio) return true; // Bio is optional
    if (typeof bio !== 'string') return false;
    return bio.length <= 500;
};

/**
 * Validate message content
 * Rules: 1-2000 characters
 * @param {string} content - Message content to validate
 * @returns {boolean} - True if valid content
 */
const isValidMessageContent = (content) => {
    if (!content || typeof content !== 'string') return false;
    const trimmed = content.trim();
    return trimmed.length >= 1 && trimmed.length <= 2000;
};

/**
 * Validate OTP code
 * Rules: 6 digits
 * @param {string} otp - OTP to validate
 * @returns {boolean} - True if valid OTP
 */
const isValidOTP = (otp) => {
    if (!otp || typeof otp !== 'string') return false;
    return /^\d{6}$/.test(otp);
};

/**
 * Sanitize string input (trim and limit length)
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input, maxLength = 1000) => {
    if (!input || typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
};

/**
 * Validate JWT token format (basic check)
 * @param {string} token - Token to validate
 * @returns {boolean} - True if valid JWT format
 */
const isValidJWT = (token) => {
    if (!token || typeof token !== 'string') return false;
    return validator.isJWT(token);
};

module.exports = {
    isValidEmail,
    isValidUsername,
    isValidPassword,
    isValidName,
    isValidURL,
    isValidObjectId,
    isValidPhone,
    isValidBio,
    isValidMessageContent,
    isValidOTP,
    isValidJWT,
    sanitizeString,
};
