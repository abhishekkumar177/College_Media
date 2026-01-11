/**
 * UploadProgress Component
 * Issue #369: Comprehensive Loading State System
 * 
 * Visual feedback for file uploads with progress percentage
 */

import React from 'react';
import '../../styles/skeleton.css';

/**
 * UploadProgress Component
 * 
 * Displays upload progress for a file
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.fileName - Name of the file being uploaded
 * @param {number} props.progress - Upload progress (0-100)
 * @param {Function} [props.onCancel] - Optional cancel handler
 * @returns {React.ReactElement} Upload progress indicator
 */
const UploadProgress = ({ fileName, progress, onCancel }) => {
    return (
        <div className="upload-progress fade-in">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                    {fileName}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                    {Math.round(progress)}%
                </span>
            </div>

            <div className="upload-progress-bar">
                <div
                    className="upload-progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                ></div>
            </div>

            {onCancel && (
                <button
                    onClick={onCancel}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                    Cancel Upload
                </button>
            )}
        </div>
    );
};

export default UploadProgress;
