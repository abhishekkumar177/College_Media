/**
 * Report Reasons and Categories
 * Constants for content moderation and reporting system
 */

export const REPORT_REASONS = {
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  VIOLENCE: 'violence',
  HATE_SPEECH: 'hate_speech',
  MISINFORMATION: 'misinformation',
  NUDITY: 'nudity',
  COPYRIGHT: 'copyright',
  OTHER: 'other',
};

export const REPORT_REASON_LABELS = {
  [REPORT_REASONS.SPAM]: 'Spam or Scam',
  [REPORT_REASONS.HARASSMENT]: 'Harassment or Bullying',
  [REPORT_REASONS.VIOLENCE]: 'Violence or Threats',
  [REPORT_REASONS.HATE_SPEECH]: 'Hate Speech',
  [REPORT_REASONS.MISINFORMATION]: 'False Information',
  [REPORT_REASONS.NUDITY]: 'Nudity or Sexual Content',
  [REPORT_REASONS.COPYRIGHT]: 'Copyright Violation',
  [REPORT_REASONS.OTHER]: 'Other',
};

export const REPORT_REASON_DESCRIPTIONS = {
  [REPORT_REASONS.SPAM]: 'Unwanted commercial content, repetitive posts, or scam attempts',
  [REPORT_REASONS.HARASSMENT]: 'Bullying, threatening, or targeting someone with unwanted behavior',
  [REPORT_REASONS.VIOLENCE]: 'Content showing, promoting, or threatening violence',
  [REPORT_REASONS.HATE_SPEECH]: 'Content attacking people based on protected characteristics',
  [REPORT_REASONS.MISINFORMATION]: 'Deliberately false or misleading information',
  [REPORT_REASONS.NUDITY]: 'Sexual or explicit content',
  [REPORT_REASONS.COPYRIGHT]: 'Unauthorized use of copyrighted material',
  [REPORT_REASONS.OTHER]: 'Something else not covered by the above categories',
};

export const REPORT_REASON_ICONS = {
  [REPORT_REASONS.SPAM]: 'mdi:email-remove-outline',
  [REPORT_REASONS.HARASSMENT]: 'mdi:alert-octagon-outline',
  [REPORT_REASONS.VIOLENCE]: 'mdi:hand-back-left-off-outline',
  [REPORT_REASONS.HATE_SPEECH]: 'mdi:chat-remove-outline',
  [REPORT_REASONS.MISINFORMATION]: 'mdi:information-off-outline',
  [REPORT_REASONS.NUDITY]: 'mdi:eye-off-outline',
  [REPORT_REASONS.COPYRIGHT]: 'mdi:copyright',
  [REPORT_REASONS.OTHER]: 'mdi:dots-horizontal',
};

export const REPORT_STATUSES = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

export const REPORT_STATUS_LABELS = {
  [REPORT_STATUSES.PENDING]: 'Pending Review',
  [REPORT_STATUSES.REVIEWING]: 'Under Review',
  [REPORT_STATUSES.RESOLVED]: 'Resolved',
  [REPORT_STATUSES.DISMISSED]: 'Dismissed',
};

export const MODERATION_ACTIONS = {
  DISMISS: 'dismiss',
  WARN_USER: 'warn_user',
  HIDE_CONTENT: 'hide_content',
  SUSPEND_USER: 'suspend_user',
  BAN_USER: 'ban_user',
  RESTORE_CONTENT: 'restore_content',
};

export const MODERATION_ACTION_LABELS = {
  [MODERATION_ACTIONS.DISMISS]: 'Dismiss Report',
  [MODERATION_ACTIONS.WARN_USER]: 'Warn User',
  [MODERATION_ACTIONS.HIDE_CONTENT]: 'Hide Content',
  [MODERATION_ACTIONS.SUSPEND_USER]: 'Suspend User',
  [MODERATION_ACTIONS.BAN_USER]: 'Ban User',
  [MODERATION_ACTIONS.RESTORE_CONTENT]: 'Restore Content',
};

export const MODERATION_ACTION_DESCRIPTIONS = {
  [MODERATION_ACTIONS.DISMISS]: 'No action needed - report does not violate guidelines',
  [MODERATION_ACTIONS.WARN_USER]: 'Send warning to user - minor violation',
  [MODERATION_ACTIONS.HIDE_CONTENT]: 'Remove content from public view',
  [MODERATION_ACTIONS.SUSPEND_USER]: 'Temporarily suspend user account (7 days)',
  [MODERATION_ACTIONS.BAN_USER]: 'Permanently ban user from platform',
  [MODERATION_ACTIONS.RESTORE_CONTENT]: 'Restore previously hidden content',
};

export const MODERATION_ACTION_COLORS = {
  [MODERATION_ACTIONS.DISMISS]: 'gray',
  [MODERATION_ACTIONS.WARN_USER]: 'yellow',
  [MODERATION_ACTIONS.HIDE_CONTENT]: 'orange',
  [MODERATION_ACTIONS.SUSPEND_USER]: 'red',
  [MODERATION_ACTIONS.BAN_USER]: 'darkred',
  [MODERATION_ACTIONS.RESTORE_CONTENT]: 'green',
};

export const REPORT_CONTENT_TYPES = {
  POST: 'post',
  COMMENT: 'comment',
  PROFILE: 'profile',
  MESSAGE: 'message',
};

export const REPORT_CONTENT_TYPE_LABELS = {
  [REPORT_CONTENT_TYPES.POST]: 'Post',
  [REPORT_CONTENT_TYPES.COMMENT]: 'Comment',
  [REPORT_CONTENT_TYPES.PROFILE]: 'Profile',
  [REPORT_CONTENT_TYPES.MESSAGE]: 'Message',
};

// Auto-flag threshold (number of reports before auto-hiding content)
export const AUTO_FLAG_THRESHOLD = 5;

// Suspension duration in days
export const SUSPENSION_DURATION_DAYS = 7;

/**
 * Get report reason options for dropdown
 */
export const getReportReasonOptions = () => {
  return Object.entries(REPORT_REASON_LABELS).map(([value, label]) => ({
    value,
    label,
    description: REPORT_REASON_DESCRIPTIONS[value],
    icon: REPORT_REASON_ICONS[value],
  }));
};

/**
 * Get moderation action options for admin
 */
export const getModerationActionOptions = () => {
  return Object.entries(MODERATION_ACTION_LABELS).map(([value, label]) => ({
    value,
    label,
    description: MODERATION_ACTION_DESCRIPTIONS[value],
    color: MODERATION_ACTION_COLORS[value],
  }));
};

/**
 * Validate report reason
 */
export const isValidReportReason = (reason) => {
  return Object.values(REPORT_REASONS).includes(reason);
};

/**
 * Validate content type
 */
export const isValidContentType = (type) => {
  return Object.values(REPORT_CONTENT_TYPES).includes(type);
};
