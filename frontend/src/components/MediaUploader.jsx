/**
 * MediaUploader Component
 * Issue #922: Advanced Media Processing Pipeline
 * 
 * Drag-and-drop media uploader with progress visualization.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import useMediaUpload from '../../hooks/useMediaUpload';

const MediaUploader = ({ onUploadComplete, maxFiles = 10, className = '' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const {
        files,
        uploading,
        stats,
        addFiles,
        removeFile,
        uploadAll,
        cancelUpload,
        cancelAll,
        clearCompleted,
        retryUpload
    } = useMediaUpload({
        maxFileSize: 100 * 1024 * 1024,
        allowedTypes: ['image/*', 'video/*']
    });

    /**
     * Handle drag events
     */
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            addFiles(droppedFiles);
        }
    }, [addFiles]);

    /**
     * Handle file input change
     */
    const handleFileSelect = useCallback((e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles.length > 0) {
            addFiles(selectedFiles);
        }
        e.target.value = '';
    }, [addFiles]);

    /**
     * Handle upload
     */
    const handleUpload = useCallback(async () => {
        const results = await uploadAll();
        if (onUploadComplete) {
            onUploadComplete(results);
        }
    }, [uploadAll, onUploadComplete]);

    /**
     * Format file size
     */
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    /**
     * Get status icon
     */
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return 'mdi:clock-outline';
            case 'uploading': return 'mdi:loading';
            case 'completed': return 'mdi:check-circle';
            case 'failed': return 'mdi:alert-circle';
            case 'cancelled': return 'mdi:close-circle';
            default: return 'mdi:file';
        }
    };

    /**
     * Get status color
     */
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-gray-500';
            case 'uploading': return 'text-blue-500 animate-spin';
            case 'completed': return 'text-green-500';
            case 'failed': return 'text-red-500';
            case 'cancelled': return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className={`media-uploader ${className}`}>
            {/* Drop Zone */}
            <div
                className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'}
        `}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <Icon
                    icon={isDragging ? 'mdi:cloud-upload' : 'mdi:cloud-upload-outline'}
                    className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500"
                />

                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    or click to browse
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Supports images and videos up to 100MB
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {files.length} file{files.length !== 1 ? 's' : ''} selected
                        </h4>
                        <div className="flex gap-2">
                            {stats.completed > 0 && (
                                <button
                                    onClick={clearCompleted}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Clear completed
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    {uploading && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${stats.overallProgress}%` }}
                            />
                        </div>
                    )}

                    {/* File items */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {files.map((fileItem) => (
                            <div
                                key={fileItem.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                                {/* Preview */}
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                    {fileItem.file.type.startsWith('image') ? (
                                        <img
                                            src={URL.createObjectURL(fileItem.file)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Icon icon="mdi:video" className="w-6 h-6 text-gray-500" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {fileItem.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatSize(fileItem.file.size)}
                                    </p>

                                    {/* Progress */}
                                    {fileItem.status === 'uploading' && (
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-1">
                                            <div
                                                className="bg-blue-600 h-1 rounded-full"
                                                style={{ width: `${fileItem.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                <Icon
                                    icon={getStatusIcon(fileItem.status)}
                                    className={`w-5 h-5 ${getStatusColor(fileItem.status)}`}
                                />

                                {/* Actions */}
                                <div className="flex gap-1">
                                    {fileItem.status === 'failed' && (
                                        <button
                                            onClick={() => retryUpload(fileItem.id)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                            title="Retry"
                                        >
                                            <Icon icon="mdi:refresh" className="w-4 h-4" />
                                        </button>
                                    )}
                                    {fileItem.status === 'uploading' && (
                                        <button
                                            onClick={() => cancelUpload(fileItem.id)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                            title="Cancel"
                                        >
                                            <Icon icon="mdi:close" className="w-4 h-4" />
                                        </button>
                                    )}
                                    {fileItem.status !== 'uploading' && (
                                        <button
                                            onClick={() => removeFile(fileItem.id)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-red-500"
                                            title="Remove"
                                        >
                                            <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleUpload}
                            disabled={uploading || stats.pending === 0}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {uploading ? 'Uploading...' : 'Upload All'}
                        </button>
                        {uploading && (
                            <button
                                onClick={cancelAll}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel All
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaUploader;
