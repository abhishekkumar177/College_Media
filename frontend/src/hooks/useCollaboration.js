/**
 * useCollaboration Hook
 * Issue #923: Real-time Collaborative Features
 * 
 * React hook for managing collaborative editing state.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { collaborationApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const useCollaboration = (sessionId, socket) => {
    const [session, setSession] = useState(null);
    const [document, setDocument] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [cursors, setCursors] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const operationQueue = useRef([]);
    const currentVersion = useRef(0);

    /**
     * Join session
     */
    const joinSession = useCallback(async (role = 'viewer') => {
        setLoading(true);
        try {
            const response = await collaborationApi.joinSession(sessionId, { role });
            setSession(response.data.data);
            setIsConnected(true);

            // Emit socket event
            if (socket) {
                socket.emit('collaboration:join', { sessionId, role });
            }

            toast.success('Joined session');
        } catch (error) {
            console.error('Join session error:', error);
            toast.error('Failed to join session');
        } finally {
            setLoading(false);
        }
    }, [sessionId, socket]);

    /**
     * Leave session
     */
    const leaveSession = useCallback(async () => {
        try {
            await collaborationApi.leaveSession(sessionId);
            setIsConnected(false);

            // Emit socket event
            if (socket) {
                socket.emit('collaboration:leave', { sessionId });
            }

            toast.success('Left session');
        } catch (error) {
            console.error('Leave session error:', error);
        }
    }, [sessionId, socket]);

    /**
     * Apply operation
     */
    const applyOperation = useCallback(async (operation) => {
        try {
            // Add to queue
            operationQueue.current.push(operation);

            // Send to server
            const response = await collaborationApi.applyOperation(sessionId, {
                operation: {
                    ...operation,
                    baseVersion: currentVersion.current
                }
            });

            // Update version
            currentVersion.current = response.data.data.version;

            // Emit socket event for real-time sync
            if (socket) {
                socket.emit('collaboration:operation', {
                    sessionId,
                    operation: response.data.data.operation
                });
            }

            return response.data.data;
        } catch (error) {
            console.error('Apply operation error:', error);
            toast.error('Failed to apply operation');
            return null;
        }
    }, [sessionId, socket]);

    /**
     * Update cursor position
     */
    const updateCursor = useCallback((position, selection) => {
        if (socket) {
            socket.emit('collaboration:cursor', {
                sessionId,
                position,
                selection
            });
        }
    }, [sessionId, socket]);

    /**
     * Insert text
     */
    const insertText = useCallback((position, content) => {
        return applyOperation({
            type: 'insert',
            position,
            content
        });
    }, [applyOperation]);

    /**
     * Delete text
     */
    const deleteText = useCallback((position, length) => {
        return applyOperation({
            type: 'delete',
            position,
            length
        });
    }, [applyOperation]);

    /**
     * Create snapshot
     */
    const createSnapshot = useCallback(async () => {
        try {
            await collaborationApi.createSnapshot(sessionId);
            toast.success('Snapshot created');
        } catch (error) {
            console.error('Create snapshot error:', error);
            toast.error('Failed to create snapshot');
        }
    }, [sessionId]);

    /**
     * Get session state
     */
    const refreshSession = useCallback(async () => {
        try {
            const response = await collaborationApi.getSessionState(sessionId);
            setSession(response.data.data.session);
            setDocument(response.data.data.document);
            setParticipants(response.data.data.activeParticipants);
        } catch (error) {
            console.error('Refresh session error:', error);
        }
    }, [sessionId]);

    /**
     * Setup socket listeners
     */
    useEffect(() => {
        if (!socket) return;

        // Listen for operations from other users
        socket.on('collaboration:operation', (data) => {
            if (data.sessionId === sessionId) {
                // Apply operation to local document
                console.log('Received operation:', data.operation);
                // Update local state
            }
        });

        // Listen for cursor updates
        socket.on('collaboration:cursor', (data) => {
            if (data.sessionId === sessionId) {
                setCursors(prev => ({
                    ...prev,
                    [data.userId]: {
                        position: data.position,
                        selection: data.selection
                    }
                }));
            }
        });

        // Listen for participant changes
        socket.on('collaboration:participant-joined', (data) => {
            if (data.sessionId === sessionId) {
                setParticipants(prev => [...prev, data.participant]);
                toast.success(`${data.participant.username} joined`);
            }
        });

        socket.on('collaboration:participant-left', (data) => {
            if (data.sessionId === sessionId) {
                setParticipants(prev => prev.filter(p => p.userId !== data.userId));
            }
        });

        return () => {
            socket.off('collaboration:operation');
            socket.off('collaboration:cursor');
            socket.off('collaboration:participant-joined');
            socket.off('collaboration:participant-left');
        };
    }, [socket, sessionId]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (isConnected) {
                leaveSession();
            }
        };
    }, [isConnected, leaveSession]);

    return {
        // State
        session,
        document,
        participants,
        cursors,
        isConnected,
        loading,

        // Actions
        joinSession,
        leaveSession,
        applyOperation,
        updateCursor,
        insertText,
        deleteText,
        createSnapshot,
        refreshSession
    };
};

export default useCollaboration;
