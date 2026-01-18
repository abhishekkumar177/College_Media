/**
 * Report Generation Service
 * Generates analytics reports in PDF, CSV, and Excel formats
 */

const AnalyticsEvent = require('../models/AnalyticsEvent');
const analyticsAggregationService = require('./analyticsAggregationService');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ReportGenerationService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../exports/reports');
    this.ensureReportsDir();
  }

  /**
   * Ensure reports directory exists
   */
  ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generate report in specified format
   */
  async generateReport(reportConfig) {
    try {
      const { type, format, startDate, endDate, userId, filters } = reportConfig;
      
      // Get report data based on type
      const data = await this.getReportData(type, startDate, endDate, userId, filters);
      
      // Generate report in requested format
      let filePath;
      switch (format.toLowerCase()) {
        case 'pdf':
          filePath = await this.generatePDFReport(data, reportConfig);
          break;
        case 'csv':
          filePath = await this.generateCSVReport(data, reportConfig);
          break;
        case 'excel':
        case 'xlsx':
          filePath = await this.generateExcelReport(data, reportConfig);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      return {
        success: true,
        filePath,
        fileName: path.basename(filePath),
        format,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error generating report', { error: error.message, reportConfig });
      throw error;
    }
  }

  /**
   * Get report data based on type
   */
  async getReportData(type, startDate, endDate, userId, filters = {}) {
    switch (type) {
      case 'dashboard':
        return analyticsAggregationService.getDashboardMetrics(userId, startDate, endDate);
      
      case 'user_engagement':
        if (!userId) throw new Error('userId required for user engagement report');
        return analyticsAggregationService.getUserEngagement(userId, startDate, endDate);
      
      case 'content_performance':
        return analyticsAggregationService.getContentPerformance(startDate, endDate, filters.limit || 50);
      
      case 'events':
        return this.getEventsReport(startDate, endDate, userId, filters);
      
      case 'funnel':
        if (!filters.steps) throw new Error('steps required for funnel report');
        return AnalyticsEvent.getFunnelAnalysis(filters.steps, new Date(startDate), new Date(endDate));
      
      case 'cohort':
        return AnalyticsEvent.getCohortAnalysis(
          filters.cohortEvent || 'user_signup',
          filters.retentionEvent || 'user_login',
          new Date(startDate),
          new Date(endDate),
          filters.periods || 12
        );
      
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  /**
   * Get events report data
   */
  async getEventsReport(startDate, endDate, userId, filters) {
    const match = {
      timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
      archived: false
    };
    
    if (userId) match.userId = userId;
    if (filters.eventType) match.eventType = filters.eventType;
    if (filters.eventCategory) match.eventCategory = filters.eventCategory;
    
    const events = await AnalyticsEvent.find(match)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 10000)
      .lean();
    
    return { events };
  }

  /**
   * Generate PDF report
   */
  async generatePDFReport(data, config) {
    const fileName = `report_${config.type}_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).text('Analytics Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Report Type: ${config.type}`);
      doc.text(`Period: ${config.startDate} to ${config.endDate}`);
      doc.text(`Generated: ${new Date().toLocaleString()}`);
      doc.moveDown();
      
      // Add report content based on type
      this.addPDFContent(doc, data, config.type);
      
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  /**
   * Add content to PDF based on report type
   */
  addPDFContent(doc, data, type) {
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    
    switch (type) {
      case 'dashboard':
        doc.text(`Total Events: ${data.totalEvents}`);
        doc.text(`Unique Users: ${data.uniqueUsers}`);
        doc.text(`Total Sessions: ${data.sessionStats.totalSessions}`);
        doc.text(`Avg Events/Session: ${data.sessionStats.avgEventsPerSession.toFixed(2)}`);
        doc.moveDown();
        
        if (data.topEvents && data.topEvents.length > 0) {
          doc.fontSize(12).text('Top Events:', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10);
          data.topEvents.forEach((event, index) => {
            doc.text(`${index + 1}. ${event.eventType}: ${event.count} events (${event.uniqueUsers} users)`);
          });
        }
        break;
      
      case 'content_performance':
        if (data && data.length > 0) {
          doc.text('Top Performing Content:');
          doc.moveDown(0.5);
          data.slice(0, 10).forEach((item, index) => {
            doc.text(`${index + 1}. Post ${item.postId}: ${item.views} views, ${item.likes} likes, ${item.comments} comments`);
          });
        }
        break;
      
      case 'events':
        doc.text(`Total Events Retrieved: ${data.events.length}`);
        break;
    }
  }

  /**
   * Generate CSV report
   */
  async generateCSVReport(data, config) {
    const fileName = `report_${config.type}_${Date.now()}.csv`;
    const filePath = path.join(this.reportsDir, fileName);
    
    let csvData;
    
    switch (config.type) {
      case 'dashboard':
        csvData = this.formatDashboardForCSV(data);
        break;
      case 'content_performance':
        csvData = data;
        break;
      case 'events':
        csvData = data.events.map(e => ({
          eventId: e.eventId,
          eventType: e.eventType,
          eventCategory: e.eventCategory,
          userId: e.userId,
          timestamp: e.timestamp,
          deviceType: e.context?.device?.type,
          country: e.context?.location?.country
        }));
        break;
      case 'funnel':
        csvData = data;
        break;
      default:
        csvData = [data];
    }
    
    const parser = new Parser();
    const csv = parser.parse(csvData);
    
    fs.writeFileSync(filePath, csv);
    
    return filePath;
  }

  /**
   * Format dashboard data for CSV
   */
  formatDashboardForCSV(data) {
    const rows = [];
    
    rows.push({
      metric: 'Total Events',
      value: data.totalEvents
    });
    
    rows.push({
      metric: 'Unique Users',
      value: data.uniqueUsers
    });
    
    rows.push({
      metric: 'Total Sessions',
      value: data.sessionStats.totalSessions
    });
    
    rows.push({
      metric: 'Avg Events Per Session',
      value: data.sessionStats.avgEventsPerSession.toFixed(2)
    });
    
    return rows;
  }

  /**
   * Generate Excel report
   */
  async generateExcelReport(data, config) {
    const fileName = `report_${config.type}_${Date.now()}.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'College Media Analytics';
    workbook.created = new Date();
    
    // Add worksheets based on report type
    switch (config.type) {
      case 'dashboard':
        this.addDashboardSheet(workbook, data);
        break;
      case 'content_performance':
        this.addContentPerformanceSheet(workbook, data);
        break;
      case 'events':
        this.addEventsSheet(workbook, data.events);
        break;
      case 'funnel':
        this.addFunnelSheet(workbook, data);
        break;
      case 'cohort':
        this.addCohortSheet(workbook, data);
        break;
    }
    
    await workbook.xlsx.writeFile(filePath);
    
    return filePath;
  }

  /**
   * Add dashboard worksheet
   */
  addDashboardSheet(workbook, data) {
    const sheet = workbook.addWorksheet('Dashboard Summary');
    
    // Header style
    const headerStyle = {
      font: { bold: true, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
      alignment: { horizontal: 'center' }
    };
    
    // Summary metrics
    sheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];
    
    sheet.getRow(1).font = headerStyle.font;
    sheet.getRow(1).fill = headerStyle.fill;
    
    sheet.addRows([
      { metric: 'Total Events', value: data.totalEvents },
      { metric: 'Unique Users', value: data.uniqueUsers },
      { metric: 'Total Sessions', value: data.sessionStats.totalSessions },
      { metric: 'Avg Events Per Session', value: data.sessionStats.avgEventsPerSession.toFixed(2) },
      { metric: 'Avg Session Duration (s)', value: data.sessionStats.avgSessionDuration.toFixed(2) }
    ]);
    
    // Top Events
    if (data.topEvents && data.topEvents.length > 0) {
      sheet.addRow([]);
      sheet.addRow({ metric: 'Top Events', value: '' }).font = { bold: true };
      
      const topEventsStart = sheet.lastRow.number + 1;
      sheet.getCell(`A${topEventsStart}`).value = 'Event Type';
      sheet.getCell(`B${topEventsStart}`).value = 'Count';
      sheet.getRow(topEventsStart).font = { bold: true };
      
      data.topEvents.forEach(event => {
        sheet.addRow({ metric: event.eventType, value: event.count });
      });
    }
  }

  /**
   * Add content performance worksheet
   */
  addContentPerformanceSheet(workbook, data) {
    const sheet = workbook.addWorksheet('Content Performance');
    
    sheet.columns = [
      { header: 'Post ID', key: 'postId', width: 30 },
      { header: 'Views', key: 'views', width: 12 },
      { header: 'Likes', key: 'likes', width: 12 },
      { header: 'Comments', key: 'comments', width: 12 },
      { header: 'Shares', key: 'shares', width: 12 },
      { header: 'Unique Users', key: 'uniqueUsers', width: 15 },
      { header: 'Engagement Score', key: 'engagementScore', width: 18 }
    ];
    
    sheet.getRow(1).font = { bold: true };
    
    data.forEach(item => {
      sheet.addRow({
        postId: item.postId.toString(),
        views: item.views,
        likes: item.likes,
        comments: item.comments,
        shares: item.shares,
        uniqueUsers: item.uniqueUsers,
        engagementScore: item.engagementScore
      });
    });
  }

  /**
   * Add events worksheet
   */
  addEventsSheet(workbook, events) {
    const sheet = workbook.addWorksheet('Events');
    
    sheet.columns = [
      { header: 'Event ID', key: 'eventId', width: 36 },
      { header: 'Type', key: 'eventType', width: 20 },
      { header: 'Category', key: 'eventCategory', width: 15 },
      { header: 'User ID', key: 'userId', width: 30 },
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Device', key: 'device', width: 12 },
      { header: 'Country', key: 'country', width: 15 }
    ];
    
    sheet.getRow(1).font = { bold: true };
    
    events.slice(0, 5000).forEach(event => {
      sheet.addRow({
        eventId: event.eventId,
        eventType: event.eventType,
        eventCategory: event.eventCategory,
        userId: event.userId?.toString() || 'N/A',
        timestamp: event.timestamp,
        device: event.context?.device?.type || 'N/A',
        country: event.context?.location?.country || 'N/A'
      });
    });
  }

  /**
   * Add funnel worksheet
   */
  addFunnelSheet(workbook, data) {
    const sheet = workbook.addWorksheet('Funnel Analysis');
    
    sheet.columns = [
      { header: 'Step', key: 'step', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Event Type', key: 'eventType', width: 20 },
      { header: 'Count', key: 'count', width: 12 },
      { header: 'Unique Users', key: 'uniqueUsers', width: 15 },
      { header: 'Conversion Rate (%)', key: 'conversionRate', width: 20 },
      { header: 'Dropoff Rate (%)', key: 'dropoffRate', width: 18 }
    ];
    
    sheet.getRow(1).font = { bold: true };
    
    data.forEach(step => {
      sheet.addRow(step);
    });
  }

  /**
   * Add cohort worksheet
   */
  addCohortSheet(workbook, data) {
    const sheet = workbook.addWorksheet('Cohort Analysis');
    
    if (data.length === 0) return;
    
    // Create dynamic columns based on retention periods
    const columns = [
      { header: 'Cohort Date', key: 'cohortDate', width: 20 },
      { header: 'Cohort Size', key: 'cohortSize', width: 15 }
    ];
    
    const maxPeriods = Math.max(...data.map(c => c.retention.length));
    for (let i = 0; i < maxPeriods; i++) {
      columns.push({
        header: `Week ${i}`,
        key: `week${i}`,
        width: 12
      });
    }
    
    sheet.columns = columns;
    sheet.getRow(1).font = { bold: true };
    
    data.forEach(cohort => {
      const row = {
        cohortDate: cohort.cohortDate,
        cohortSize: cohort.cohortSize
      };
      
      cohort.retention.forEach((period, index) => {
        row[`week${index}`] = `${period.retentionRate}%`;
      });
      
      sheet.addRow(row);
    });
  }

  /**
   * Delete old reports
   */
  async cleanupOldReports(daysOld = 30) {
    const files = fs.readdirSync(this.reportsDir);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;
    
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(this.reportsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      
      if (age > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    logger.info(`Cleaned up ${deletedCount} old reports`);
    return deletedCount;
  }
}

module.exports = new ReportGenerationService();
