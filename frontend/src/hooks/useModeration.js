/**
 * useModeration Hook
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * React hook for managing moderation state and actions.
 */

import { useState, useCallback } from 'react';
import { moderationApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const useModeration = () => {
    const [queue, setQueue] = useState([]);
    const [appeals, setAppeals] = useState([]);
    const [filters, setFilters] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch moderation queue
    const fetchQueue = useCallback(async (options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (options.status) params.append('status', options.status);
            if (options.page) params.append('page', options.page);
            if (options.limit) params.append('limit', options.limit);
            if (options.category) params.append('category', options.category);
            if (options.priority) params.append('priority', options.priority);

            const response = await moderationApi.getQueue(params.toString());
            setQueue(response.data.data.items || []);
            return response.data;
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch moderation queue');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Analyze content with AI
    const analyzeContent = useCallback(async (content) => {
        setLoading(true);
        try {
            const response = await moderationApi.analyze(content);
            return response.data.data;
        } catch (err) {
            toast.error('Content analysis failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Take moderation action
    const takeAction = useCallback(async (queueItemId, action, reason, notes = '') => {
        setLoading(true);
        try {
            const response = await moderationApi.takeAction(queueItemId, { action, reason, notes });
            toast.success(`Action "${action}" completed`);
            // Refresh queue
            await fetchQueue();
            return response.data;
        } catch (err) {
            toast.error('Failed to take action');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchQueue]);

    // Bulk action
    const bulkAction = useCallback(async (itemIds, action, reason) => {
        setLoading(true);
        try {
            const response = await moderationApi.bulkAction({ itemIds, action, reason });
            const successCount = response.data.data.filter(r => r.success).length;
            toast.success(`Bulk action completed: ${successCount}/${itemIds.length} items`);
            await fetchQueue();
            return response.data;
        } catch (err) {
            toast.error('Bulk action failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchQueue]);

    // Fetch appeals
    const fetchAppeals = useCallback(async (options = {}) => {
        setLoading(true);
        try {
            const response = await moderationApi.getAppeals(options);
            setAppeals(response.data.data.appeals || []);
            return response.data;
        } catch (err) {
            toast.error('Failed to fetch appeals');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Submit appeal
    const submitAppeal = useCallback(async (actionId, reason, evidence = []) => {
        setLoading(true);
        try {
            const response = await moderationApi.submitAppeal({ actionId, reason, evidence });
            toast.success('Appeal submitted successfully');
            return response.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit appeal');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch filters
    const fetchFilters = useCallback(async (options = {}) => {
        setLoading(true);
        try {
            const response = await moderationApi.getFilters(options);
            setFilters(response.data.data || []);
            return response.data;
        } catch (err) {
            toast.error('Failed to fetch filters');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create filter
    const createFilter = useCallback(async (filterData) => {
        setLoading(true);
        try {
            const response = await moderationApi.createFilter(filterData);
            toast.success('Filter created successfully');
            await fetchFilters();
            return response.data;
        } catch (err) {
            toast.error('Failed to create filter');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchFilters]);

    // Fetch statistics
    const fetchStatistics = useCallback(async (startDate, endDate) => {
        setLoading(true);
        try {
            const response = await moderationApi.getStatistics({ startDate, endDate });
            setStatistics(response.data.data);
            return response.data;
        } catch (err) {
            toast.error('Failed to fetch statistics');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // State
        queue,
        appeals,
        filters,
        statistics,
        loading,
        error,

        // Actions
        fetchQueue,
        analyzeContent,
        takeAction,
        bulkAction,
        fetchAppeals,
        submitAppeal,
        fetchFilters,
        createFilter,
        fetchStatistics
    };
};

export default useModeration;
