import { useContext, useState, useCallback } from 'react';
import ModerationContext from '../context/ModerationContext';

/**
 * Main hook to access moderation context
 */
export const useModeration = () => {
  const context = useContext(ModerationContext);
  if (!context) {
    throw new Error('useModeration must be used within a ModerationProvider');
  }
  return context;
};

/**
 * Hook for report submission (for regular users)
 */
export const useReportSubmission = () => {
  const { submitReport } = useModeration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (reportData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitReport(reportData);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to submit report');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitReport]);

  return {
    submit,
    isSubmitting,
    error,
  };
};

/**
 * Hook for admin actions on reports
 */
export const useModerationActions = () => {
  const { takeAction, bulkAction, dismissReport } = useModeration();
  const [isProcessing, setIsProcessing] = useState(false);

  const performAction = useCallback(async (reportId, action, notes = '') => {
    setIsProcessing(true);
    try {
      await takeAction(reportId, action, notes);
    } finally {
      setIsProcessing(false);
    }
  }, [takeAction]);

  const performBulkAction = useCallback(async (reportIds, action, notes = '') => {
    setIsProcessing(true);
    try {
      await bulkAction(reportIds, action, notes);
    } finally {
      setIsProcessing(false);
    }
  }, [bulkAction]);

  const dismiss = useCallback(async (reportId, reason = '') => {
    setIsProcessing(true);
    try {
      await dismissReport(reportId, reason);
    } finally {
      setIsProcessing(false);
    }
  }, [dismissReport]);

  return {
    performAction,
    performBulkAction,
    dismiss,
    isProcessing,
  };
};

/**
 * Hook for fetching reports with filters
 */
export const useReports = () => {
  const { reports, loading, filters, pagination, fetchReports, updateFilters, resetFilters } = useModeration();

  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchReports(pagination.page + 1, false);
    }
  }, [loading, pagination, fetchReports]);

  const refresh = useCallback(() => {
    fetchReports(1, true);
  }, [fetchReports]);

  const applyFilters = useCallback((newFilters) => {
    updateFilters(newFilters);
    // Fetch with new filters will be triggered by context useEffect
    setTimeout(() => fetchReports(1, true), 0);
  }, [updateFilters, fetchReports]);

  const clearFilters = useCallback(() => {
    resetFilters();
    setTimeout(() => fetchReports(1, true), 0);
  }, [resetFilters, fetchReports]);

  return {
    reports,
    loading,
    filters,
    pagination,
    loadMore,
    refresh,
    applyFilters,
    clearFilters,
  };
};

/**
 * Hook for moderation statistics
 */
export const useModerationStats = () => {
  const { statistics, fetchStatistics } = useModeration();
  const [loading, setLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      await fetchStatistics();
    } finally {
      setLoading(false);
    }
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    refreshStats,
  };
};

/**
 * Hook for appeal submission
 */
export const useAppeal = () => {
  const { submitAppeal } = useModeration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (reportId, appealData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitAppeal(reportId, appealData);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to submit appeal');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitAppeal]);

  return {
    submit,
    isSubmitting,
    error,
  };
};

/**
 * Hook to check if content should be auto-flagged
 */
export const useAutoFlag = () => {
  const { checkAutoFlag } = useModeration();
  return { checkAutoFlag };
};

/**
 * Hook for report details
 */
export const useReportDetails = (reportId) => {
  const { fetchReportDetails } = useModeration();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDetails = useCallback(async () => {
    if (!reportId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReportDetails(reportId);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  }, [reportId, fetchReportDetails]);

  return {
    report,
    loading,
    error,
    loadDetails,
  };
};
