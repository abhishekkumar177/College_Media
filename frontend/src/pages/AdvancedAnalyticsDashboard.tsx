/**
 * Advanced Analytics Dashboard
 * Comprehensive analytics with real-time updates and customizable widgets
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CustomLineChart,
  CustomBarChart,
  CustomAreaChart,
  CustomPieChart,
  MetricCard
} from '../components/analytics/ChartComponents';
import '../components/analytics/ChartComponents.css';
import './AdvancedAnalyticsDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface DashboardMetrics {
  totalEvents: number;
  uniqueUsers: number;
  sessionStats: {
    totalSessions: number;
    avgEventsPerSession: number;
    avgSessionDuration: number;
  };
  topEvents: Array<{ eventType: string; count: number; uniqueUsers: number }>;
  deviceBreakdown: Array<{ deviceType: string; count: number }>;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  });
  const [activeWidget, setActiveWidget] = useState<string>('overview');

  useEffect(() => {
    fetchDashboardMetrics();
    
    // Fetch real-time metrics every 30 seconds
    const interval = setInterval(fetchRealTimeMetrics, 30000);
    fetchRealTimeMetrics();
    
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/advanced-analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      
      setMetrics(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading dashboard metrics');
      console.error('Dashboard metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/advanced-analytics/realtime`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { minutes: 5 }
      });
      
      setRealTimeData(response.data.data);
    } catch (err) {
      console.error('Real-time metrics error:', err);
    }
  };

  const handleDateRangeChange = (preset: string) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (preset) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }
    
    setDateRange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  };

  const generateReport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/advanced-analytics/reports/generate`,
        {
          type: 'dashboard',
          format,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Download the report
      window.location.href = `${API_BASE_URL}/api/advanced-analytics/reports/download/${response.data.data.fileName}`;
    } catch (err: any) {
      console.error('Report generation error:', err);
      alert('Error generating report: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading && !metrics) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <h2>Error Loading Analytics</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardMetrics}>Retry</button>
      </div>
    );
  }

  return (
    <div className="advanced-analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Analytics Dashboard</h1>
          <p className="subtitle">Comprehensive insights into your platform performance</p>
        </div>
        <div className="header-right">
          <div className="date-range-selector">
            <button onClick={() => handleDateRangeChange('today')}>Today</button>
            <button onClick={() => handleDateRangeChange('7days')}>7 Days</button>
            <button onClick={() => handleDateRangeChange('30days')}>30 Days</button>
            <button onClick={() => handleDateRangeChange('90days')}>90 Days</button>
          </div>
          <div className="export-buttons">
            <button onClick={() => generateReport('pdf')}>📄 PDF</button>
            <button onClick={() => generateReport('csv')}>📊 CSV</button>
            <button onClick={() => generateReport('excel')}>📈 Excel</button>
          </div>
        </div>
      </div>

      {/* Real-time Indicator */}
      {realTimeData && (
        <div className="real-time-banner">
          <span className="pulse-dot"></span>
          <span>Live: {realTimeData.activeUsers} active users in the last 5 minutes</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button
          className={activeWidget === 'overview' ? 'active' : ''}
          onClick={() => setActiveWidget('overview')}
        >
          📊 Overview
        </button>
        <button
          className={activeWidget === 'engagement' ? 'active' : ''}
          onClick={() => setActiveWidget('engagement')}
        >
          💬 Engagement
        </button>
        <button
          className={activeWidget === 'content' ? 'active' : ''}
          onClick={() => setActiveWidget('content')}
        >
          📝 Content
        </button>
        <button
          className={activeWidget === 'devices' ? 'active' : ''}
          onClick={() => setActiveWidget('devices')}
        >
          📱 Devices
        </button>
      </div>

      {/* Metric Cards */}
      {metrics && activeWidget === 'overview' && (
        <>
          <div className="metrics-grid">
            <MetricCard
              title="Total Events"
              value={metrics.totalEvents.toLocaleString()}
              icon="📊"
            />
            <MetricCard
              title="Unique Users"
              value={metrics.uniqueUsers.toLocaleString()}
              icon="👥"
            />
            <MetricCard
              title="Total Sessions"
              value={metrics.sessionStats.totalSessions.toLocaleString()}
              icon="🔄"
            />
            <MetricCard
              title="Avg Session Duration"
              value={`${Math.round(metrics.sessionStats.avgSessionDuration)}s`}
              icon="⏱️"
            />
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Top Events</h3>
              <CustomBarChart
                data={metrics.topEvents}
                xKey="eventType"
                yKeys={['count']}
                height={300}
              />
            </div>

            <div className="chart-card">
              <h3>Device Distribution</h3>
              <CustomPieChart
                data={metrics.deviceBreakdown}
                nameKey="deviceType"
                dataKey="count"
                height={300}
              />
            </div>
          </div>

          {/* Real-time Chart */}
          {realTimeData && realTimeData.eventsPerMinute && (
            <div className="chart-card full-width">
              <h3>Real-Time Events (Last 5 Minutes)</h3>
              <CustomLineChart
                data={realTimeData.eventsPerMinute}
                xKey="minute"
                yKeys={['count']}
                height={250}
              />
            </div>
          )}
        </>
      )}

      {activeWidget === 'engagement' && (
        <div className="widget-content">
          <h2>User Engagement Metrics</h2>
          <p>Engagement analytics coming soon...</p>
        </div>
      )}

      {activeWidget === 'content' && (
        <div className="widget-content">
          <h2>Content Performance</h2>
          <p>Content analytics coming soon...</p>
        </div>
      )}

      {activeWidget === 'devices' && metrics && (
        <div className="widget-content">
          <div className="chart-card">
            <h3>Device Analytics</h3>
            <CustomPieChart
              data={metrics.deviceBreakdown}
              nameKey="deviceType"
              dataKey="count"
              height={400}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
