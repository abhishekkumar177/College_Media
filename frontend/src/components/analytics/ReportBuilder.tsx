/**
 * Report Builder Component
 * UI for creating custom analytics reports
 */

import React, { useState } from 'react';
import axios from 'axios';
import './ReportBuilder.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface ReportConfig {
  name: string;
  type: string;
  format: string;
  schedule: {
    frequency: string;
    hour: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  recipients: Array<{ email: string; name: string }>;
  config: {
    dateRange: string;
    filters: any;
  };
}

const ReportBuilder: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: '',
    type: 'dashboard',
    format: 'pdf',
    schedule: {
      frequency: 'weekly',
      hour: 8,
      dayOfWeek: 1
    },
    recipients: [],
    config: {
      dateRange: 'last_7_days',
      filters: {}
    }
  });
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddRecipient = () => {
    if (recipientEmail && recipientName) {
      setReportConfig({
        ...reportConfig,
        recipients: [...reportConfig.recipients, { email: recipientEmail, name: recipientName }]
      });
      setRecipientEmail('');
      setRecipientName('');
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setReportConfig({
      ...reportConfig,
      recipients: reportConfig.recipients.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportConfig.name) {
      setError('Report name is required');
      return;
    }
    
    if (reportConfig.recipients.length === 0) {
      setError('At least one recipient is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_BASE_URL}/api/advanced-analytics/reports/schedule`,
        reportConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset form
        setReportConfig({
          name: '',
          type: 'dashboard',
          format: 'pdf',
          schedule: {
            frequency: 'weekly',
            hour: 8,
            dayOfWeek: 1
          },
          recipients: [],
          config: {
            dateRange: 'last_7_days',
            filters: {}
          }
        });
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating scheduled report');
      console.error('Report creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/advanced-analytics/reports/generate`,
        {
          type: reportConfig.type,
          format: reportConfig.format,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Download the report
      window.location.href = `${API_BASE_URL}/api/advanced-analytics/reports/download/${response.data.data.fileName}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error generating report');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-builder">
      <div className="report-builder-header">
        <h2>📊 Report Builder</h2>
        <p>Create custom analytics reports with scheduled delivery</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✓</span>
          <p>Scheduled report created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="report-form">
        {/* Report Details */}
        <div className="form-section">
          <h3>Report Details</h3>
          
          <div className="form-group">
            <label>Report Name *</label>
            <input
              type="text"
              value={reportConfig.name}
              onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
              placeholder="e.g., Weekly Analytics Summary"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Report Type *</label>
              <select
                value={reportConfig.type}
                onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
              >
                <option value="dashboard">Dashboard Overview</option>
                <option value="user_engagement">User Engagement</option>
                <option value="content_performance">Content Performance</option>
                <option value="events">Event Log</option>
                <option value="funnel">Funnel Analysis</option>
                <option value="cohort">Cohort Analysis</option>
              </select>
            </div>

            <div className="form-group">
              <label>Format *</label>
              <select
                value={reportConfig.format}
                onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel (XLSX)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date Range</label>
            <select
              value={reportConfig.config.dateRange}
              onChange={(e) => setReportConfig({
                ...reportConfig,
                config: { ...reportConfig.config, dateRange: e.target.value }
              })}
            >
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>
        </div>

        {/* Schedule */}
        <div className="form-section">
          <h3>Schedule</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Frequency *</label>
              <select
                value={reportConfig.schedule.frequency}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  schedule: { ...reportConfig.schedule, frequency: e.target.value }
                })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Time (Hour)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={reportConfig.schedule.hour}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  schedule: { ...reportConfig.schedule, hour: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>

          {reportConfig.schedule.frequency === 'weekly' && (
            <div className="form-group">
              <label>Day of Week</label>
              <select
                value={reportConfig.schedule.dayOfWeek}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  schedule: { ...reportConfig.schedule, dayOfWeek: parseInt(e.target.value) }
                })}
              >
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="0">Sunday</option>
              </select>
            </div>
          )}

          {reportConfig.schedule.frequency === 'monthly' && (
            <div className="form-group">
              <label>Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={reportConfig.schedule.dayOfMonth || 1}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  schedule: { ...reportConfig.schedule, dayOfMonth: parseInt(e.target.value) }
                })}
              />
            </div>
          )}
        </div>

        {/* Recipients */}
        <div className="form-section">
          <h3>Recipients</h3>
          
          <div className="recipient-input">
            <input
              type="text"
              placeholder="Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <button type="button" onClick={handleAddRecipient}>
              Add
            </button>
          </div>

          {reportConfig.recipients.length > 0 && (
            <div className="recipient-list">
              {reportConfig.recipients.map((recipient, index) => (
                <div key={index} className="recipient-item">
                  <span>{recipient.name} ({recipient.email})</span>
                  <button type="button" onClick={() => handleRemoveRecipient(index)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleGenerateNow}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Generating...' : '⚡ Generate Now'}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : '📅 Schedule Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportBuilder;
