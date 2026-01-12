import React from 'react';
import { Icon } from '@iconify/react';

const ModerationWarning = ({ isOpen, onClose, onBypass, warnings }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-amber-500">
                        <Icon icon="mdi:alert-circle" className="w-8 h-8" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Content Warning</h3>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        It looks like your post might contain some issues:
                    </p>

                    <ul className="space-y-2 mb-6">
                        {warnings.map((warning, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                <Icon icon="mdi:close-circle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{warning}</span>
                            </li>
                        ))}
                    </ul>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        We want to keep our community safe and friendly. You can edit your post to resolve these issues, or proceed if you think this is a mistake.
                    </p>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Edit Post
                        </button>
                        <button
                            onClick={onBypass}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Post Anyway
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModerationWarning;
