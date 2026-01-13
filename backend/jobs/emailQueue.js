const Queue = require('bull');
const { Resend } = require('resend');
const logger = require('../utils/logger');

// Redis connection (use existing config)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize Resend
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

// Create email queue
const emailQueue = new Queue('email-notifications', REDIS_URL, {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 50
    }
});

// Email templates
const templates = {
    welcome: (data) => ({
        subject: `Welcome to College Media, ${data.firstName}! 🎉`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to College Media!</h1>
        <p>Hi ${data.firstName},</p>
        <p>Thank you for joining our community! We're excited to have you here.</p>
        <p>Start connecting with fellow students and alumni today:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Find and follow friends</li>
          <li>Share your first post</li>
        </ul>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" 
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Complete Your Profile
        </a>
        <p style="margin-top: 20px; color: #666;">The College Media Team</p>
      </div>
    `
    }),

    newMessage: (data) => ({
        subject: `New message from ${data.senderName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">You have a new message!</h2>
        <p>Hi ${data.recipientName},</p>
        <p><strong>${data.senderName}</strong> sent you a message:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;">"${data.messagePreview}..."</p>
        </div>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/messages" 
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Message
        </a>
      </div>
    `
    }),

    newFollower: (data) => ({
        subject: `${data.followerName} started following you!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">You have a new follower! 🎉</h2>
        <p>Hi ${data.userName},</p>
        <p><strong>${data.followerName}</strong> (@${data.followerUsername}) is now following you.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/${data.followerUsername}" 
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Profile
        </a>
      </div>
    `
    }),

    passwordChanged: (data) => ({
        subject: 'Your password has been changed',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Password Changed</h2>
        <p>Hi ${data.firstName},</p>
        <p>Your password was successfully changed on ${new Date().toLocaleDateString()}.</p>
        <p style="color: #dc2626;"><strong>If you didn't make this change, please contact support immediately.</strong></p>
        <p>For security, we recommend:</p>
        <ul>
          <li>Using a unique password for each account</li>
          <li>Enabling two-factor authentication</li>
        </ul>
        <p style="color: #666;">The College Media Security Team</p>
      </div>
    `
    })
};

// Process email jobs
emailQueue.process(async (job) => {
    const { type, to, data } = job.data;

    if (!resend) {
        logger.warn('Resend not configured, skipping email:', { type, to });
        return { skipped: true, reason: 'No API key' };
    }

    try {
        const template = templates[type];
        if (!template) {
            throw new Error(`Unknown email template: ${type}`);
        }

        const { subject, html } = template(data);

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'College Media <noreply@collegemedia.com>',
            to,
            subject,
            html
        });

        logger.info(`Email sent successfully: ${type} to ${to}`, { id: result.id });
        return { success: true, id: result.id };
    } catch (error) {
        logger.error(`Email send failed: ${type} to ${to}`, error);
        throw error; // Will trigger retry
    }
});

// Event handlers
emailQueue.on('completed', (job, result) => {
    logger.debug(`Email job ${job.id} completed`, result);
});

emailQueue.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed after ${job.attemptsMade} attempts`, err);
});

// Queue health check
emailQueue.on('error', (error) => {
    logger.error('Email queue error:', error);
});

module.exports = emailQueue;
