/**
 * Notification Templates
 * Issue #906: Real-time Notification System with Push Notifications
 * 
 * Template system for generating notification content.
 */

const notificationTemplates = {

    /**
     * Like notification
     */
    like: {
        title: (data) => `New Like`,
        message: (data) => `${data.username} liked your ${data.contentType}`,
        actionText: 'View',
        priority: 'low'
    },

    /**
     * Comment notification
     */
    comment: {
        title: (data) => `New Comment`,
        message: (data) => `${data.username} commented on your post: "${data.comment}"`,
        actionText: 'Reply',
        priority: 'normal'
    },

    /**
     * Follow notification
     */
    follow: {
        title: (data) => `New Follower`,
        message: (data) => `${data.username} started following you`,
        actionText: 'View Profile',
        priority: 'normal'
    },

    /**
     * Mention notification
     */
    mention: {
        title: (data) => `You were mentioned`,
        message: (data) => `${data.username} mentioned you in a ${data.contentType}`,
        actionText: 'View',
        priority: 'high'
    },

    /**
     * Share notification
     */
    share: {
        title: (data) => `Post Shared`,
        message: (data) => `${data.username} shared your post`,
        actionText: 'View',
        priority: 'low'
    },

    /**
     * Message notification
     */
    message: {
        title: (data) => `New Message`,
        message: (data) => `${data.username}: ${data.preview}`,
        actionText: 'Reply',
        priority: 'high'
    },

    /**
     * Post notification (from followed user)
     */
    post: {
        title: (data) => `New Post`,
        message: (data) => `${data.username} posted: "${data.caption}"`,
        actionText: 'View',
        priority: 'low'
    },

    /**
     * System notification
     */
    system: {
        title: (data) => data.title || 'System Notification',
        message: (data) => data.message,
        actionText: 'Learn More',
        priority: 'normal'
    },

    /**
     * Announcement notification
     */
    announcement: {
        title: (data) => data.title || 'Announcement',
        message: (data) => data.message,
        actionText: 'Read More',
        priority: 'high'
    },

    /**
     * Achievement notification
     */
    achievement: {
        title: (data) => `Achievement Unlocked!`,
        message: (data) => `You've earned the "${data.achievementName}" badge!`,
        actionText: 'View',
        priority: 'normal'
    },

    /**
     * Reminder notification
     */
    reminder: {
        title: (data) => `Reminder`,
        message: (data) => data.message,
        actionText: 'View',
        priority: 'normal'
    },

    /**
     * Warning notification
     */
    warning: {
        title: (data) => `Warning`,
        message: (data) => data.message,
        actionText: 'Review',
        priority: 'urgent'
    }
};

/**
 * Generate notification from template
 */
function generateNotification(type, data) {
    const template = notificationTemplates[type];

    if (!template) {
        throw new Error(`Unknown notification type: ${type}`);
    }

    return {
        type,
        title: typeof template.title === 'function' ? template.title(data) : template.title,
        message: typeof template.message === 'function' ? template.message(data) : template.message,
        actionText: template.actionText,
        priority: template.priority,
        data
    };
}

/**
 * Generate batch notifications
 */
function generateBatchNotification(type, items, count) {
    const templates = {
        like: {
            title: 'New Likes',
            message: `${count} people liked your post`,
            actionText: 'View All'
        },
        comment: {
            title: 'New Comments',
            message: `${count} new comments on your post`,
            actionText: 'View All'
        },
        follow: {
            title: 'New Followers',
            message: `${count} people started following you`,
            actionText: 'View All'
        }
    };

    const template = templates[type];

    if (!template) {
        return null;
    }

    return {
        type,
        title: template.title,
        message: template.message,
        actionText: template.actionText,
        priority: 'normal',
        data: {
            items,
            count
        }
    };
}

/**
 * Get email template
 */
function getEmailTemplate(type, data) {
    const baseTemplate = notificationTemplates[type];

    if (!baseTemplate) {
        return null;
    }

    const title = typeof baseTemplate.title === 'function'
        ? baseTemplate.title(data)
        : baseTemplate.title;

    const message = typeof baseTemplate.message === 'function'
        ? baseTemplate.message(data)
        : baseTemplate.message;

    return {
        subject: title,
        body: `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${title}</h2>
          <p>${message}</p>
          ${data.actionUrl ? `<a href="${data.actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">${baseTemplate.actionText}</a>` : ''}
          <hr style="margin-top: 30px;">
          <p style="color: #666; font-size: 12px;">This is an automated notification from College Media. To manage your notification preferences, visit your settings.</p>
        </body>
      </html>
    `
    };
}

module.exports = {
    notificationTemplates,
    generateNotification,
    generateBatchNotification,
    getEmailTemplate
};
