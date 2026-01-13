/**
 * useTypingIndicator Hook
 * Issue #423: Implement Real-time Typing Indicators for Comments
 * 
 * A custom hook for managing real-time typing indicators in comment sections.
 * Uses Socket.io for real-time communication (simulated if socket not available).
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useTypingIndicator
 * 
 * @param {string} postId - The post ID to track typing for
 * @param {string} userId - Current user's ID
 * @param {string} username - Current user's username
 * @param {Object} socket - Socket.io instance (optional, will simulate if not provided)
 * @returns {Object} { typingUsers, startTyping, stopTyping, isTyping }
 */
const useTypingIndicator = (postId, userId, username, socket = null) => {
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const TYPING_TIMEOUT = 3000; // 3 seconds

    // Start typing indicator
    const startTyping = useCallback(() => {
        if (!postId || !userId) return;

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // If not already typing, emit start event
        if (!isTyping) {
            setIsTyping(true);

            if (socket && socket.emit) {
                socket.emit('typing:start', {
                    postId,
                    userId,
                    username: username || 'Anonymous'
                });
            }
        }

        // Set timeout to auto-stop typing
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, TYPING_TIMEOUT);
    }, [postId, userId, username, socket, isTyping]);

    // Stop typing indicator
    const stopTyping = useCallback(() => {
        if (!postId || !userId) return;

        setIsTyping(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        if (socket && socket.emit) {
            socket.emit('typing:stop', {
                postId,
                userId
            });
        }
    }, [postId, userId, socket]);

    // Listen for typing events from other users
    useEffect(() => {
        if (!socket || !postId) return;

        // Handler for when another user starts typing
        const handleUserTyping = ({ userId: typingUserId, username: typingUsername, postId: eventPostId }) => {
            // Only handle events for this post and ignore own typing
            if (eventPostId === postId && typingUserId !== userId) {
                setTypingUsers(prev => {
                    // Check if user is already in the list
                    const exists = prev.some(user => user.userId === typingUserId);
                    if (exists) return prev;

                    // Add new typing user
                    return [...prev, { userId: typingUserId, username: typingUsername }];
                });
            }
        };

        // Handler for when another user stops typing
        const handleUserStopped = ({ userId: typingUserId, postId: eventPostId }) => {
            if (eventPostId === postId) {
                setTypingUsers(prev => prev.filter(user => user.userId !== typingUserId));
            }
        };

        // Register socket listeners
        if (socket.on) {
            socket.on('user:typing', handleUserTyping);
            socket.on('user:stopped', handleUserStopped);
        }

        // Cleanup
        return () => {
            if (socket.off) {
                socket.off('user:typing', handleUserTyping);
                socket.off('user:stopped', handleUserStopped);
            }

            // Stop typing on unmount
            if (isTyping) {
                stopTyping();
            }
        };
    }, [socket, postId, userId, isTyping, stopTyping]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return {
        typingUsers,
        startTyping,
        stopTyping,
        isTyping
    };
};

export default useTypingIndicator;

/**
 * Example Usage:
 * 
 * const { typingUsers, startTyping, stopTyping } = useTypingIndicator(
 *   postId,
 *   currentUser.id,
 *   currentUser.username,
 *   socket
 * );
 * 
 * // In textarea onChange
 * const handleChange = (e) => {
 *   setValue(e.target.value);
 *   startTyping(); // Auto-stops after 3 seconds
 * };
 * 
 * // On submit or blur
 * const handleSubmit = () => {
 *   stopTyping();
 *   // ... submit logic
 * };
 */
