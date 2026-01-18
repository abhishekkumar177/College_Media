/**
 * Scheduled Report Service
 * Manages scheduled analytics report generation and delivery
 */

const reportGenerationService = require('./reportGenerationService');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const mongoose = require('mongoose');

// Scheduled Report Model
const scheduledReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['dashboard', 'user_engagement', 'content_performance', 'events', 'funnel', 'cohort']
  },
  format: {
    type: String,
    required: true,
    enum: ['pdf', 'csv', 'excel']
  },
  schedule: {
    frequency: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'custom']
    },
    cronExpression: String, // For custom schedules
    dayOfWeek: Number, // 0-6 for weekly
    dayOfMonth: Number, // 1-31 for monthly
    hour: {
      type: Number,
      default: 8
    }
  },
  recipients: [{
    email: String,
    name: String
  }],
  config: {
    userId: mongoose.Schema.Types.ObjectId,
    filters: mongoose.Schema.Types.Mixed,
    dateRange: {
      type: String,
      enum: ['yesterday', 'last_7_days', 'last_30_days', 'last_month', 'custom'],
      default: 'last_7_days'
    },
    customStartDate: Date,
    customEndDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: Date,
  nextRun: Date,
  runCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

scheduledReportSchema.index({ nextRun: 1, isActive: 1 });

const ScheduledReport = mongoose.model('ScheduledReport', scheduledReportSchema);

class ScheduledReportService {
  constructor() {
    this.cronJobs = new Map();
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeEmailTransporter() {
    if (process.env.SMTP_HOST) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      logger.info('Email transporter initialized for scheduled reports');
    } else {
      logger.warn('SMTP not configured - scheduled reports will not be emailed');
    }
  }

  /**
   * Create a new scheduled report
   */
  async createScheduledReport(reportData) {
    try {
      const cronExpression = this.getCronExpression(reportData.schedule);
      const nextRun = this.getNextRunDate(reportData.schedule);
      
      const scheduledReport = new ScheduledReport({
        ...reportData,
        schedule: {
          ...reportData.schedule,
          cronExpression
        },
        nextRun
      });
      
      await scheduledReport.save();
      
      // Start cron job
      this.scheduleCronJob(scheduledReport);
      
      logger.info('Scheduled report created', { 
        id: scheduledReport._id, 
        name: scheduledReport.name 
      });
      
      return scheduledReport;
    } catch (error) {
      logger.error('Error creating scheduled report', { error: error.message });
      throw error;
    }
  }

  /**
   * Get cron expression from schedule
   */
  getCronExpression(schedule) {
    if (schedule.cronExpression) {
      return schedule.cronExpression;
    }
    
    const hour = schedule.hour || 8;
    
    switch (schedule.frequency) {
      case 'daily':
        return `0 ${hour} * * *`; // Every day at specified hour
      
      case 'weekly':
        const dayOfWeek = schedule.dayOfWeek || 1; // Default Monday
        return `0 ${hour} * * ${dayOfWeek}`;
      
      case 'monthly':
        const dayOfMonth = schedule.dayOfMonth || 1; // Default 1st of month
        return `0 ${hour} ${dayOfMonth} * *`;
      
      default:
        throw new Error(`Unsupported frequency: ${schedule.frequency}`);
    }
  }

  /**
   * Get next run date
   */
  getNextRunDate(schedule) {
    const now = new Date();
    const next = new Date();
    const hour = schedule.hour || 8;
    
    next.setHours(hour, 0, 0, 0);
    
    switch (schedule.frequency) {
      case 'daily':
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;
      
      case 'weekly':
        const targetDay = schedule.dayOfWeek || 1;
        const currentDay = next.getDay();
        let daysToAdd = targetDay - currentDay;
        
        if (daysToAdd < 0 || (daysToAdd === 0 && next <= now)) {
          daysToAdd += 7;
        }
        
        next.setDate(next.getDate() + daysToAdd);
        break;
      
      case 'monthly':
        const targetDate = schedule.dayOfMonth || 1;
        next.setDate(targetDate);
        
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;
    }
    
    return next;
  }

  /**
   * Schedule cron job for report
   */
  scheduleCronJob(scheduledReport) {
    const cronExpression = scheduledReport.schedule.cronExpression;
    
    if (!cron.validate(cronExpression)) {
      logger.error('Invalid cron expression', { 
        id: scheduledReport._id, 
        expression: cronExpression 
      });
      return;
    }
    
    const job = cron.schedule(cronExpression, async () => {
      await this.executeScheduledReport(scheduledReport._id);
    });
    
    this.cronJobs.set(scheduledReport._id.toString(), job);
    
    logger.info('Cron job scheduled', { 
      id: scheduledReport._id, 
      expression: cronExpression 
    });
  }

  /**
   * Execute a scheduled report
   */
  async executeScheduledReport(reportId) {
    try {
      const scheduledReport = await ScheduledReport.findById(reportId);
      
      if (!scheduledReport || !scheduledReport.isActive) {
        logger.warn('Scheduled report not found or inactive', { reportId });
        return;
      }
      
      logger.info('Executing scheduled report', { 
        id: reportId, 
        name: scheduledReport.name 
      });
      
      // Calculate date range
      const { startDate, endDate } = this.getDateRange(scheduledReport.config.dateRange);
      
      // Generate report
      const reportConfig = {
        type: scheduledReport.type,
        format: scheduledReport.format,
        startDate,
        endDate,
        userId: scheduledReport.config.userId,
        filters: scheduledReport.config.filters || {}
      };
      
      const result = await reportGenerationService.generateReport(reportConfig);
      
      // Send email
      if (this.emailTransporter && scheduledReport.recipients.length > 0) {
        await this.sendReportEmail(scheduledReport, result);
      }
      
      // Update report metadata
      scheduledReport.lastRun = new Date();
      scheduledReport.nextRun = this.getNextRunDate(scheduledReport.schedule);
      scheduledReport.runCount += 1;
      await scheduledReport.save();
      
      logger.info('Scheduled report executed successfully', { 
        id: reportId,
        filePath: result.filePath 
      });
    } catch (error) {
      logger.error('Error executing scheduled report', { 
        reportId, 
        error: error.message 
      });
    }
  }

  /**
   * Get date range for report
   */
  getDateRange(dateRangeType) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRangeType) {
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'last_7_days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      
      case 'last_30_days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      
      case 'last_month':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(1);
        endDate.setHours(0, 0, 0, -1);
        break;
    }
    
    return { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    };
  }

  /**
   * Send report via email
   */
  async sendReportEmail(scheduledReport, reportResult) {
    const recipients = scheduledReport.recipients.map(r => r.email).join(', ');
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@collegemedia.com',
      to: recipients,
      subject: `Scheduled Report: ${scheduledReport.name}`,
      html: `
        <h2>${scheduledReport.name}</h2>
        <p>Your scheduled analytics report is ready.</p>
        <p><strong>Report Type:</strong> ${scheduledReport.type}</p>
        <p><strong>Generated:</strong> ${reportResult.generatedAt.toLocaleString()}</p>
        <p><strong>Format:</strong> ${reportResult.format.toUpperCase()}</p>
        <p>Please find the report attached.</p>
        <br>
        <p><em>This is an automated report from College Media Analytics.</em></p>
      `,
      attachments: [
        {
          filename: reportResult.fileName,
          path: reportResult.filePath
        }
      ]
    };
    
    await this.emailTransporter.sendMail(mailOptions);
    
    logger.info('Report email sent', { 
      reportId: scheduledReport._id, 
      recipients 
    });
  }

  /**
   * Load and start all active scheduled reports
   */
  async loadScheduledReports() {
    try {
      const reports = await ScheduledReport.find({ isActive: true });
      
      logger.info(`Loading ${reports.length} scheduled reports`);
      
      for (const report of reports) {
        this.scheduleCronJob(report);
      }
      
      logger.info('All scheduled reports loaded');
    } catch (error) {
      logger.error('Error loading scheduled reports', { error: error.message });
    }
  }

  /**
   * Update scheduled report
   */
  async updateScheduledReport(reportId, updates) {
    try {
      const report = await ScheduledReport.findById(reportId);
      
      if (!report) {
        throw new Error('Scheduled report not found');
      }
      
      // Stop existing cron job
      this.stopCronJob(reportId);
      
      // Update report
      Object.assign(report, updates);
      
      if (updates.schedule) {
        report.schedule.cronExpression = this.getCronExpression(updates.schedule);
        report.nextRun = this.getNextRunDate(updates.schedule);
      }
      
      await report.save();
      
      // Restart cron job if active
      if (report.isActive) {
        this.scheduleCronJob(report);
      }
      
      logger.info('Scheduled report updated', { reportId });
      
      return report;
    } catch (error) {
      logger.error('Error updating scheduled report', { reportId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete scheduled report
   */
  async deleteScheduledReport(reportId) {
    try {
      this.stopCronJob(reportId);
      await ScheduledReport.findByIdAndDelete(reportId);
      
      logger.info('Scheduled report deleted', { reportId });
    } catch (error) {
      logger.error('Error deleting scheduled report', { reportId, error: error.message });
      throw error;
    }
  }

  /**
   * Stop cron job
   */
  stopCronJob(reportId) {
    const jobKey = reportId.toString();
    const job = this.cronJobs.get(jobKey);
    
    if (job) {
      job.stop();
      this.cronJobs.delete(jobKey);
      logger.info('Cron job stopped', { reportId });
    }
  }

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(userId) {
    return ScheduledReport.find({ createdBy: userId }).sort({ createdAt: -1 });
  }

  /**
   * Get scheduled report by ID
   */
  async getScheduledReport(reportId) {
    return ScheduledReport.findById(reportId);
  }
}

module.exports = new ScheduledReportService();
module.exports.ScheduledReport = ScheduledReport;
