/**
 * FilterRuleBuilder Component
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * UI component for creating custom content filter rules.
 */

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const FilterRuleBuilder = ({ onSubmit, onCancel }) => {
    const [filter, setFilter] = useState({
        name: '',
        description: '',
        filterType: 'word',
        pattern: '',
        regexFlags: 'gi',
        category: 'custom',
        severity: 'medium',
        action: 'flag',
        applyTo: ['all']
    });
    const [testContent, setTestContent] = useState('');
    const [testResult, setTestResult] = useState(null);

    const handleChange = (field, value) => {
        setFilter(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyToChange = (value) => {
        setFilter(prev => {
            const current = prev.applyTo;
            if (value === 'all') {
                return { ...prev, applyTo: ['all'] };
            }
            const filtered = current.filter(v => v !== 'all');
            if (filtered.includes(value)) {
                return { ...prev, applyTo: filtered.filter(v => v !== value) };
            }
            return { ...prev, applyTo: [...filtered, value] };
        });
    };

    const testFilter = () => {
        if (!filter.pattern || !testContent) {
            toast.error('Enter both pattern and test content');
            return;
        }

        try {
            let matches = false;

            if (filter.filterType === 'regex' || filter.filterType === 'pattern') {
                const regex = new RegExp(filter.pattern, filter.regexFlags || 'gi');
                matches = regex.test(testContent);
            } else if (filter.filterType === 'word') {
                const words = testContent.toLowerCase().split(/\s+/);
                matches = words.includes(filter.pattern.toLowerCase());
            } else if (filter.filterType === 'phrase') {
                matches = testContent.toLowerCase().includes(filter.pattern.toLowerCase());
            }

            setTestResult({
                matches,
                message: matches ? 'Pattern matched!' : 'No match found'
            });
        } catch (error) {
            setTestResult({
                matches: false,
                error: true,
                message: `Invalid pattern: ${error.message}`
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!filter.name || !filter.pattern) {
            toast.error('Name and pattern are required');
            return;
        }

        onSubmit(filter);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create Content Filter
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Filter Name *
                        </label>
                        <input
                            type="text"
                            value={filter.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g., Spam Links Filter"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <select
                            value={filter.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="profanity">Profanity</option>
                            <option value="hate_speech">Hate Speech</option>
                            <option value="spam">Spam</option>
                            <option value="personal_info">Personal Info</option>
                            <option value="adult_content">Adult Content</option>
                            <option value="violence">Violence</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        value={filter.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe what this filter catches..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-20"
                    />
                </div>

                {/* Pattern Configuration */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Pattern Configuration
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Filter Type
                            </label>
                            <select
                                value={filter.filterType}
                                onChange={(e) => handleChange('filterType', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="word">Word (Exact Match)</option>
                                <option value="phrase">Phrase (Contains)</option>
                                <option value="regex">Regular Expression</option>
                                <option value="pattern">Pattern</option>
                            </select>
                        </div>

                        {(filter.filterType === 'regex' || filter.filterType === 'pattern') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Regex Flags
                                </label>
                                <input
                                    type="text"
                                    value={filter.regexFlags}
                                    onChange={(e) => handleChange('regexFlags', e.target.value)}
                                    placeholder="gi"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pattern *
                        </label>
                        <input
                            type="text"
                            value={filter.pattern}
                            onChange={(e) => handleChange('pattern', e.target.value)}
                            placeholder={filter.filterType === 'regex' ? '\\b(spam|scam)\\b' : 'Enter word or phrase...'}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                            required
                        />
                    </div>

                    {/* Test Section */}
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Test Content
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={testContent}
                                onChange={(e) => setTestContent(e.target.value)}
                                placeholder="Enter text to test..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={testFilter}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Test
                            </button>
                        </div>
                        {testResult && (
                            <div className={`mt-2 p-2 rounded-lg text-sm ${testResult.error
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : testResult.matches
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                <Icon
                                    icon={testResult.matches ? 'mdi:check-circle' : 'mdi:alert-circle'}
                                    className="inline mr-2"
                                />
                                {testResult.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Configuration */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Severity
                        </label>
                        <select
                            value={filter.severity}
                            onChange={(e) => handleChange('severity', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Action
                        </label>
                        <select
                            value={filter.action}
                            onChange={(e) => handleChange('action', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="flag">Flag for Review</option>
                            <option value="hide">Auto-hide Content</option>
                            <option value="remove">Auto-remove Content</option>
                            <option value="block">Block Submission</option>
                        </select>
                    </div>
                </div>

                {/* Apply To */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Apply To
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'posts', 'comments', 'messages', 'profiles'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleApplyToChange(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter.applyTo.includes(type)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Create Filter
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FilterRuleBuilder;
