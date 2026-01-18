/**
 * useRecommendations Hook
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * React hook for managing recommendations state.
 */

import { useState, useEffect, useCallback } from 'react';
import { recommendationsApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const useRecommendations = (options = {}) => {
    const {
        type = 'post',
        autoFetch = true,
        limit = 20
    } = options;

    const [recommendations, setRecommendations] = useState([]);
    const [trending, setTrending] = useState([]);
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    /**
     * Fetch personalized recommendations
     */
    const fetchRecommendations = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await recommendationsApi.getRecommendations({ type, limit });
            setRecommendations(response.data.data.recommendations);
        } catch (err) {
            console.error('Fetch recommendations error:', err);
            setError('Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    }, [type, limit]);

    /**
     * Fetch trending content
     */
    const fetchTrending = useCallback(async (hours = 24) => {
        try {
            const response = await recommendationsApi.getTrending({ type, hours, limit });
            setTrending(response.data.data.trending);
        } catch (err) {
            console.error('Fetch trending error:', err);
        }
    }, [type, limit]);

    /**
     * Fetch user suggestions
     */
    const fetchUserSuggestions = useCallback(async () => {
        try {
            const response = await recommendationsApi.getUserRecommendations({ limit: 10 });
            setUserSuggestions(response.data.data.recommendations);
        } catch (err) {
            console.error('Fetch user suggestions error:', err);
        }
    }, []);

    /**
     * Fetch recommendation statistics
     */
    const fetchStats = useCallback(async () => {
        try {
            const response = await recommendationsApi.getStats();
            setStats(response.data.data.stats);
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    }, []);

    /**
     * Track user interaction
     */
    const trackInteraction = useCallback(async (itemId, itemType, interactionType, context = {}) => {
        try {
            await recommendationsApi.trackInteraction({
                itemId,
                itemType,
                interactionType,
                context
            });
        } catch (err) {
            console.error('Track interaction error:', err);
        }
    }, []);

    /**
     * Submit feedback for recommendation
     */
    const submitFeedback = useCallback(async (itemId, feedback) => {
        try {
            await recommendationsApi.submitFeedback({
                itemId,
                type,
                feedback
            });

            // Update local state
            setRecommendations(prev =>
                prev.map(rec =>
                    rec.itemId === itemId
                        ? { ...rec, feedback: { [feedback]: true } }
                        : rec
                )
            );

            if (feedback === 'dismissed') {
                setRecommendations(prev => prev.filter(rec => rec.itemId !== itemId));
            }
        } catch (err) {
            console.error('Submit feedback error:', err);
            toast.error('Failed to save feedback');
        }
    }, [type]);

    /**
     * Dismiss recommendation
     */
    const dismissRecommendation = useCallback((itemId) => {
        submitFeedback(itemId, 'dismissed');
    }, [submitFeedback]);

    /**
     * Mark recommendation as clicked
     */
    const markClicked = useCallback((itemId) => {
        submitFeedback(itemId, 'clicked');
        trackInteraction(itemId, type, 'click', { source: 'recommendation' });
    }, [submitFeedback, trackInteraction, type]);

    /**
     * Refresh recommendations
     */
    const refresh = useCallback(async () => {
        await Promise.all([
            fetchRecommendations(),
            fetchTrending(),
            fetchUserSuggestions()
        ]);
    }, [fetchRecommendations, fetchTrending, fetchUserSuggestions]);

    /**
     * Auto-fetch on mount
     */
    useEffect(() => {
        if (autoFetch) {
            refresh();
        }
    }, [autoFetch, refresh]);

    return {
        // State
        recommendations,
        trending,
        userSuggestions,
        loading,
        error,
        stats,

        // Actions
        fetchRecommendations,
        fetchTrending,
        fetchUserSuggestions,
        fetchStats,
        trackInteraction,
        submitFeedback,
        dismissRecommendation,
        markClicked,
        refresh
    };
};

export default useRecommendations;
