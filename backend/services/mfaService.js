const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Multi-Factor Authentication Service
 * Implements TOTP-based 2FA with backup codes
 * Issue #884: MFA Implementation
 */
class MFAService {
    /**
     * Generate MFA Secret and QR Code
     * @param {string} userId - User ID
     * @param {string} email - User email for QR label
     * @returns {Object} { secret, qrCodeUrl, otpauth }
     */
    static async generateSecret(userId, email) {
        try {
            // Generate secret using speakeasy
            const secret = speakeasy.generateSecret({
                name: `College Media (${email})`,
                issuer: 'College Media',
                length: 32
            });

            // Generate QR code
            const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

            logger.info(`MFA secret generated for user: ${userId}`);

            return {
                secret: secret.base32,
                qrCodeUrl,
                otpauth: secret.otpauth_url
            };
        } catch (error) {
            logger.error('MFA Secret generation error:', error);
            throw new Error('Failed to generate MFA secret');
        }
    }

    /**
     * Verify TOTP Token
     * @param {string} token - 6-digit OTP token
     * @param {string} secret - User's MFA secret
     * @returns {boolean} - Whether token is valid
     */
    static verifyToken(token, secret) {
        try {
            const verified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 2 // Allow 2 time steps before and after
            });
            return verified;
        } catch (error) {
            logger.error('MFA token verification error:', error);
            return false;
        }
    }

    /**
     * Generate Backup Codes
     * @param {number} count - Number of backup codes to generate
     * @returns {Array<string>} - Array of backup codes
     */
    static generateBackupCodes(count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            // Generate 8-character alphanumeric codes
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }
        return codes;
    }

    /**
     * Hash backup codes for storage
     * @param {Array<string>} codes - Plain text backup codes
     * @returns {Array<string>} - Hashed backup codes
     */
    static async hashBackupCodes(codes) {
        const hashedCodes = [];
        for (const code of codes) {
            const hashed = await bcrypt.hash(code, 10);
            hashedCodes.push(hashed);
        }
        return hashedCodes;
    }

    /**
     * Verify backup code
     * @param {string} code - Plain text backup code
     * @param {Array<string>} hashedCodes - Array of hashed backup codes
     * @returns {number} - Index of matching code or -1
     */
    static async verifyBackupCode(code, hashedCodes) {
        for (let i = 0; i < hashedCodes.length; i++) {
            const isMatch = await bcrypt.compare(code, hashedCodes[i]);
            if (isMatch) return i;
        }
        return -1;
    }

    /**
     * Enable MFA for user
     * @param {string} userId - User ID
     * @param {string} secret - MFA secret
     * @param {string} token - Verification token
     * @returns {Object} - { backupCodes }
     */
    static async enableMFA(userId, secret, token) {
        try {
            // Verify token one last time before enabling
            const isValid = this.verifyToken(token, secret);
            if (!isValid) {
                throw new Error('Invalid OTP token. Please try again.');
            }

            // Generate and hash backup codes
            const plainBackupCodes = this.generateBackupCodes();
            const hashedBackupCodes = await this.hashBackupCodes(plainBackupCodes);

            // Update user with MFA settings
            const user = await User.findByIdAndUpdate(
                userId,
                {
                    twoFactorEnabled: true,
                    twoFactorSecret: secret,
                    backupCodes: hashedBackupCodes
                },
                { new: true }
            );

            if (!user) {
                throw new Error('User not found');
            }

            logger.info(`MFA enabled for user: ${userId}`);

            // Return plain backup codes (only time they're shown)
            return { backupCodes: plainBackupCodes };
        } catch (error) {
            logger.error('MFA enable error:', error);
            throw error;
        }
    }

    /**
     * Disable MFA for user
     * @param {string} userId - User ID
     * @param {string} token - Verification token
     * @returns {boolean} - Success status
     */
    static async disableMFA(userId, token) {
        try {
            const user = await User.findById(userId).select('+twoFactorSecret +backupCodes');
            
            if (!user || !user.twoFactorEnabled) {
                throw new Error('MFA is not enabled for this user');
            }

            // Verify token before disabling
            const isValid = this.verifyToken(token, user.twoFactorSecret);
            if (!isValid) {
                throw new Error('Invalid OTP token. Please try again.');
            }

            // Disable MFA and clear secrets
            await User.findByIdAndUpdate(userId, {
                twoFactorEnabled: false,
                twoFactorSecret: undefined,
                backupCodes: []
            });

            logger.info(`MFA disabled for user: ${userId}`);
            return true;
        } catch (error) {
            logger.error('MFA disable error:', error);
            throw error;
        }
    }

    /**
     * Authenticate with MFA (OTP or Backup Code)
     * @param {Object} user - User object with MFA fields
     * @param {string} token - OTP token or backup code
     * @returns {boolean} - Authentication success
     */
    static async authenticate(user, token) {
        try {
            if (!user.twoFactorEnabled || !user.twoFactorSecret) {
                return true; // MFA not enabled, allow login
            }

            // 1. Try TOTP verification
            const isValidOTP = this.verifyToken(token, user.twoFactorSecret);
            if (isValidOTP) {
                logger.info(`Successful MFA login via TOTP for user: ${user._id}`);
                return true;
            }

            // 2. Try Backup Codes
            if (user.backupCodes && user.backupCodes.length > 0) {
                const codeIndex = await this.verifyBackupCode(token, user.backupCodes);
                
                if (codeIndex !== -1) {
                    // Remove used backup code
                    const updatedCodes = [...user.backupCodes];
                    updatedCodes.splice(codeIndex, 1);
                    
                    await User.findByIdAndUpdate(user._id, {
                        backupCodes: updatedCodes
                    });

                    logger.info(`Successful MFA login via backup code for user: ${user._id}`);
                    logger.warn(`Backup code used. Remaining codes: ${updatedCodes.length}`);
                    
                    return true;
                }
            }

            logger.warn(`Failed MFA attempt for user: ${user._id}`);
            return false;
        } catch (error) {
            logger.error('MFA authentication error:', error);
            return false;
        }
    }

    /**
     * Check MFA status for user
     * @param {string} userId - User ID
     * @returns {Object} - MFA status information
     */
    static async getMFAStatus(userId) {
        try {
            const user = await User.findById(userId).select('twoFactorEnabled backupCodes');
            
            if (!user) {
                throw new Error('User not found');
            }

            return {
                enabled: user.twoFactorEnabled || false,
                backupCodesRemaining: user.backupCodes ? user.backupCodes.length : 0
            };
        } catch (error) {
            logger.error('Get MFA status error:', error);
            throw error;
        }
    }

    /**
     * Regenerate backup codes
     * @param {string} userId - User ID
     * @param {string} token - Verification token
     * @returns {Array<string>} - New backup codes
     */
    static async regenerateBackupCodes(userId, token) {
        try {
            const user = await User.findById(userId).select('+twoFactorSecret +backupCodes');
            
            if (!user || !user.twoFactorEnabled) {
                throw new Error('MFA is not enabled for this user');
            }

            // Verify token before regenerating
            const isValid = this.verifyToken(token, user.twoFactorSecret);
            if (!isValid) {
                throw new Error('Invalid OTP token. Please try again.');
            }

            // Generate and hash new backup codes
            const plainBackupCodes = this.generateBackupCodes();
            const hashedBackupCodes = await this.hashBackupCodes(plainBackupCodes);

            // Update user with new backup codes
            await User.findByIdAndUpdate(userId, {
                backupCodes: hashedBackupCodes
            });

            logger.info(`Backup codes regenerated for user: ${userId}`);
            return plainBackupCodes;
        } catch (error) {
            logger.error('Regenerate backup codes error:', error);
            throw error;
        }
    }
}

module.exports = MFAService;
