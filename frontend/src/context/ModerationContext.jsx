import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { moderationApi } from '../api/endpoints';
import { REPORT_STATUSES, AUTO_FLAG_THRESHOLD } from '../utils/reportReasons';

const ModerationContext = createContext();

export const ModerationProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    contentType: 'all',
    reason: 'all',
    sortBy: 'recent',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    resolved: 0,
    dismissed: 0,
    autoFlagged: 0,
  });

  /**
   * Submit a new report
   */
  const submitReport = useCallback(async (reportData) => {
    try {
      const response = await moderationApi.submitReport(reportData);
      
      toast.success('Report submitted successfully. Thank you for helping keep our community safe.');
      
      return response.data;
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report. Please try again.');
      throw error;
    }
  }, []);

  /**
   * Fetch reports (admin only)
   */
  const fetchReports = useCallback(async (page = 1, resetList = false) => {
    setLoading(true);
    try {
      const response = await moderationApi.getReports({
        page,
        limit: pagination.limit,
        ...filters,
      });

      const { reports: newReports, pagination: newPagination } = response.data;

      if (resetList) {
        setReports(newReports);
      } else {
        setReports(prev => [...prev, ...newReports]);
      }

      setPagination(newPagination);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  /**
   * Fetch single report details
   */
  const fetchReportDetails = useCallback(async (reportId) => {
    try {
      const response = await moderationApi.getReportDetails(reportId);
      return response.data;
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Failed to load report details');
      throw error;
    }
  }, []);

  /**
   * Take action on a report
   */
  const takeAction = useCallback(async (reportId, action, notes = '') => {
    try {
      const response = await moderationApi.takeAction(reportId, { action, notes });
      
      // Update local state
      setReports(prev =>
        prev.map(report =>
          report._id === reportId
            ? { ...report, status: REPORT_STATUSES.RESOLVED, action, actionNotes: notes }
            : report
        )
      );

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        pending: prev.pending - 1,
        resolved: prev.resolved + 1,
      }));

      toast.success(`Action taken: ${action.replace('_', ' ')}`);
      
      return response.data;
    } catch (error) {
      console.error('Error taking action:', error);
      toast.error(error.response?.data?.message || 'Failed to take action');
      throw error;
    }
  }, []);

  /**
   * Bulk action on multiple reports
   */
  const bulkAction = useCallback(async (reportIds, action, notes = '') => {
    try {
      const response = await moderationApi.bulkAction({ reportIds, action, notes });
      
      // Refresh reports list
      await fetchReports(1, true);
      
      toast.success(`Bulk action applied to ${reportIds.length} report(s)`);
      
      return response.data;
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
      throw error;
    }
  }, [fetchReports]);

  /**
   * Dismiss a report
   */
  const dismissReport = useCallback(async (reportId, reason = '') => {
    try {
      await takeAction(reportId, 'dismiss', reason);
      
      setReports(prev =>
        prev.map(report =>
          report._id === reportId
            ? { ...report, status: REPORT_STATUSES.DISMISSED }
            : report
        )
      );

      setStatistics(prev => ({
        ...prev,
        pending: prev.pending - 1,
        dismissed: prev.dismissed + 1,
      }));
    } catch (error) {
      throw error;
    }
  }, [takeAction]);

  /**
   * Submit an appeal for moderation action
   */
  const submitAppeal = useCallback(async (reportId, appealData) => {
    try {
      const response = await moderationApi.submitAppeal({ reportId, ...appealData });
      
      toast.success('Appeal submitted successfully. We will review it shortly.');
      
      return response.data;
    } catch (error) {
      console.error('Error submitting appeal:', error);
      toast.error('Failed to submit appeal');
      throw error;
    }
  }, []);

  /**
   * Fetch moderation statistics
   */
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await moderationApi.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      contentType: 'all',
      reason: 'all',
      sortBy: 'recent',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Check if content should be auto-flagged
   */
  const checkAutoFlag = useCallback((reportCount) => {
    return reportCount >= AUTO_FLAG_THRESHOLD;
  }, []);

  // Fetch reports when filters change
  useEffect(() => {
    // Only fetch if user is admin (this check should be done based on auth context)
    // For now, we'll skip auto-fetching and let components explicitly call fetchReports
  }, [filters]);

  const value = {
    // State
    reports,
    loading,
    filters,
    pagination,
    statistics,

    // Actions
    submitReport,
    fetchReports,
    fetchReportDetails,
    takeAction,
    bulkAction,
    dismissReport,
    submitAppeal,
    fetchStatistics,
    updateFilters,
    resetFilters,
    checkAutoFlag,
  };

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  );
};

export const useModeration = () => {
  const context = useContext(ModerationContext);
  if (!context) {
    throw new Error('useModeration must be used within a ModerationProvider');
  }
  return context;
};

export default ModerationContext;
