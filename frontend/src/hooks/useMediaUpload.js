/**
 * useMediaUpload Hook
 * Issue #922: Advanced Media Processing Pipeline
 * 
 * React hook for media upload with progress tracking.
 */

import { useState, useCallback, useRef } from 'react';
import { mediaApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const useMediaUpload = (options = {}) => {
    const {
        maxFileSize = 100 * 1024 * 1024, // 100MB
        allowedTypes = ['image/*', 'video/*'],
        autoProcess = true
    } = options;

    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({});
    const [results, setResults] = useState([]);
    const abortControllers = useRef({});

    /**
     * Add files to upload queue
     */
    const addFiles = useCallback((newFiles) => {
        const validated = Array.from(newFiles).filter(file => {
            // Check file size
            if (file.size > maxFileSize) {
                toast.error(`${file.name} exceeds maximum file size`);
                return false;
            }

            // Check file type
            const isAllowed = allowedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.replace('/*', ''));
                }
                return file.type === type;
            });

            if (!isAllowed) {
                toast.error(`${file.name} is not an allowed file type`);
                return false;
            }

            return true;
        });

        setFiles(prev => [
            ...prev,
            ...validated.map(file => ({
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                file,
                status: 'pending',
                progress: 0,
                result: null,
                error: null
            }))
        ]);

        return validated.length;
    }, [maxFileSize, allowedTypes]);

    /**
     * Remove file from queue
     */
    const removeFile = useCallback((fileId) => {
        // Cancel upload if in progress
        if (abortControllers.current[fileId]) {
            abortControllers.current[fileId].abort();
            delete abortControllers.current[fileId];
        }

        setFiles(prev => prev.filter(f => f.id !== fileId));
        setProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
        });
    }, []);

    /**
     * Upload single file
     */
    const uploadFile = useCallback(async (fileItem, processOptions = {}) => {
        const { id, file } = fileItem;

        // Create abort controller
        abortControllers.current[id] = new AbortController();

        try {
            // Update status
            setFiles(prev => prev.map(f =>
                f.id === id ? { ...f, status: 'uploading' } : f
            ));

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', file.type.startsWith('video') ? 'video' : 'image');
            formData.append('processOptions', JSON.stringify(processOptions));

            // Upload with progress tracking
            const response = await mediaApi.upload(formData, {
                signal: abortControllers.current[id].signal,
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(prev => ({ ...prev, [id]: percent }));
                    setFiles(prev => prev.map(f =>
                        f.id === id ? { ...f, progress: percent } : f
                    ));
                }
            });

            // Update status
            setFiles(prev => prev.map(f =>
                f.id === id ? { ...f, status: 'completed', result: response.data.data } : f
            ));

            setResults(prev => [...prev, { fileId: id, ...response.data.data }]);

            toast.success(`${file.name} uploaded successfully`);

            return response.data.data;
        } catch (error) {
            if (error.name === 'AbortError') {
                setFiles(prev => prev.map(f =>
                    f.id === id ? { ...f, status: 'cancelled' } : f
                ));
            } else {
                setFiles(prev => prev.map(f =>
                    f.id === id ? { ...f, status: 'failed', error: error.message } : f
                ));
                toast.error(`Failed to upload ${file.name}`);
            }
            throw error;
        } finally {
            delete abortControllers.current[id];
        }
    }, []);

    /**
     * Upload all pending files
     */
    const uploadAll = useCallback(async (processOptions = {}) => {
        setUploading(true);

        const pendingFiles = files.filter(f => f.status === 'pending');
        const uploadResults = [];

        for (const fileItem of pendingFiles) {
            try {
                const result = await uploadFile(fileItem, processOptions);
                uploadResults.push(result);
            } catch (error) {
                // Continue with next file
            }
        }

        setUploading(false);
        return uploadResults;
    }, [files, uploadFile]);

    /**
     * Cancel upload
     */
    const cancelUpload = useCallback((fileId) => {
        if (abortControllers.current[fileId]) {
            abortControllers.current[fileId].abort();
        }
    }, []);

    /**
     * Cancel all uploads
     */
    const cancelAll = useCallback(() => {
        Object.values(abortControllers.current).forEach(controller => {
            controller.abort();
        });
        abortControllers.current = {};

        setFiles(prev => prev.map(f =>
            f.status === 'uploading' ? { ...f, status: 'cancelled' } : f
        ));
        setUploading(false);
    }, []);

    /**
     * Clear completed uploads
     */
    const clearCompleted = useCallback(() => {
        setFiles(prev => prev.filter(f => f.status !== 'completed'));
    }, []);

    /**
     * Retry failed upload
     */
    const retryUpload = useCallback(async (fileId, processOptions = {}) => {
        const fileItem = files.find(f => f.id === fileId);
        if (!fileItem || fileItem.status !== 'failed') return;

        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, status: 'pending', error: null } : f
        ));

        return uploadFile(fileItem, processOptions);
    }, [files, uploadFile]);

    /**
     * Get upload statistics
     */
    const getStats = useCallback(() => {
        const stats = {
            total: files.length,
            pending: 0,
            uploading: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
            totalSize: 0,
            uploadedSize: 0
        };

        files.forEach(f => {
            stats[f.status]++;
            stats.totalSize += f.file.size;
            if (f.status === 'completed') {
                stats.uploadedSize += f.file.size;
            } else if (f.status === 'uploading') {
                stats.uploadedSize += (f.file.size * f.progress) / 100;
            }
        });

        stats.overallProgress = stats.totalSize > 0
            ? Math.round((stats.uploadedSize / stats.totalSize) * 100)
            : 0;

        return stats;
    }, [files]);

    return {
        // State
        files,
        uploading,
        progress,
        results,
        stats: getStats(),

        // Actions
        addFiles,
        removeFile,
        uploadFile,
        uploadAll,
        cancelUpload,
        cancelAll,
        clearCompleted,
        retryUpload
    };
};

export default useMediaUpload;
