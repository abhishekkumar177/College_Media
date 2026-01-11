/**
 * KeyboardShortcutsHelp Component
 * Issue #422: Implement Global Keyboard Shortcuts System
 * 
 * A modal that displays all available keyboard shortcuts organized by category.
 * Includes search functionality to filter shortcuts.
 */

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { getShortcutsByCategory, formatShortcutKeys } from '../utils/keyboardShortcuts';
import useFocusTrap from '../hooks/useFocusTrap';

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { modalRef } = useFocusTrap(isOpen, onClose);

    if (!isOpen) return null;

    const shortcutsByCategory = getShortcutsByCategory();

    // Filter shortcuts based on search query
    const filteredShortcuts = {};
    Object.entries(shortcutsByCategory).forEach(([category, shortcuts]) => {
        const filtered = shortcuts.filter(shortcut =>
            shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        if (filtered.length > 0) {
            filteredShortcuts[category] = filtered;
        }
    });

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="shortcuts-title"
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2
                                id="shortcuts-title"
                                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                            >
                                ⌨️ Keyboard Shortcuts
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <Icon icon="mdi:close" width={24} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Icon
                                icon="mdi:magnify"
                                width={20}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search shortcuts..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Shortcuts List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {Object.keys(filteredShortcuts).length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No shortcuts found matching "{searchQuery}"
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(filteredShortcuts).map(([category, shortcuts]) => (
                                    <div key={category}>
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                            {category}
                                        </h3>
                                        <div className="space-y-2">
                                            {shortcuts.map((shortcut) => (
                                                <div
                                                    key={shortcut.id}
                                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {shortcut.description}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {formatShortcutKeys(shortcut.keys, shortcut.sequence)
                                                            .split(' ')
                                                            .map((key, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    {key === 'then' || key === 'or' ? (
                                                                        <span className="text-xs text-gray-400 mx-1">{key}</span>
                                                                    ) : (
                                                                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                                                            {key}
                                                                        </kbd>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Press <kbd className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded">?</kbd> anytime to show this help
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default KeyboardShortcutsHelp;
