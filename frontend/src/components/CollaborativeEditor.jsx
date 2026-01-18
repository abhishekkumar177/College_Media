/**
 * CollaborativeEditor Component
 * Issue #923: Real-time Collaborative Features
 * 
 * Real-time collaborative text editor with cursor tracking.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import useCollaboration from '../../hooks/useCollaboration';
import PresenceIndicator from './PresenceIndicator';

const CollaborativeEditor = ({ sessionId, socket, initialContent = '' }) => {
    const [content, setContent] = useState(initialContent);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const editorRef = useRef(null);
    const lastContentRef = useRef(initialContent);

    const {
        session,
        participants,
        cursors,
        isConnected,
        joinSession,
        leaveSession,
        insertText,
        deleteText,
        updateCursor,
        createSnapshot
    } = useCollaboration(sessionId, socket);

    /**
     * Handle text input
     */
    const handleInput = (e) => {
        const newContent = e.target.value;
        const oldContent = lastContentRef.current;

        // Calculate diff
        if (newContent.length > oldContent.length) {
            // Insertion
            const insertPos = cursorPosition;
            const insertedText = newContent.slice(insertPos, insertPos + (newContent.length - oldContent.length));
            insertText(insertPos, insertedText);
        } else if (newContent.length < oldContent.length) {
            // Deletion
            const deletePos = cursorPosition;
            const deleteLength = oldContent.length - newContent.length;
            deleteText(deletePos, deleteLength);
        }

        setContent(newContent);
        lastContentRef.current = newContent;
    };

    /**
     * Handle cursor/selection change
     */
    const handleSelectionChange = () => {
        if (!editorRef.current) return;

        const start = editorRef.current.selectionStart;
        const end = editorRef.current.selectionEnd;

        setCursorPosition(start);
        setSelection({ start, end });
        updateCursor(start, { start, end });
    };

    /**
     * Join session on mount
     */
    useEffect(() => {
        joinSession('editor');

        return () => {
            leaveSession();
        };
    }, [joinSession, leaveSession]);

    /**
     * Update content from document
     */
    useEffect(() => {
        if (session?.document?.content) {
            const docContent = typeof session.document.content === 'string'
                ? session.document.content
                : session.document.content.text || '';

            setContent(docContent);
            lastContentRef.current = docContent;
        }
    }, [session]);

    return (
        <div className="collaborative-editor h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Collaborative Editor
                    </h3>

                    {isConnected && (
                        <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Connected
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Participants */}
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:account-multiple" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {participants.length} online
                        </span>
                    </div>

                    {/* Snapshot button */}
                    <button
                        onClick={createSnapshot}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        title="Create snapshot"
                    >
                        <Icon icon="mdi:content-save" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Presence indicators */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                {participants.map((participant) => (
                    <PresenceIndicator
                        key={participant.userId}
                        user={participant}
                        cursor={cursors[participant.userId]}
                    />
                ))}
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
                <textarea
                    ref={editorRef}
                    value={content}
                    onChange={handleInput}
                    onSelect={handleSelectionChange}
                    onClick={handleSelectionChange}
                    onKeyUp={handleSelectionChange}
                    className="w-full h-full p-6 bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none font-mono text-sm leading-relaxed"
                    placeholder="Start typing..."
                    spellCheck="false"
                />

                {/* Remote cursors overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {Object.entries(cursors).map(([userId, cursor]) => {
                        const participant = participants.find(p => p.userId === userId);
                        if (!participant || !cursor) return null;

                        // Calculate cursor position (simplified)
                        const lines = content.slice(0, cursor.position).split('\n');
                        const line = lines.length;
                        const col = lines[lines.length - 1].length;

                        return (
                            <div
                                key={userId}
                                className="absolute"
                                style={{
                                    top: `${line * 1.5}rem`,
                                    left: `${col * 0.6}rem`,
                                    width: '2px',
                                    height: '1.5rem',
                                    backgroundColor: participant.color || '#3b82f6',
                                    animation: 'blink 1s infinite'
                                }}
                            >
                                <div
                                    className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                                    style={{ backgroundColor: participant.color || '#3b82f6' }}
                                >
                                    {participant.username}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-4">
                    <span>Lines: {content.split('\n').length}</span>
                    <span>Characters: {content.length}</span>
                    <span>Position: {cursorPosition}</span>
                </div>

                {session && (
                    <div>
                        Version: {session.currentVersion}
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default CollaborativeEditor;
