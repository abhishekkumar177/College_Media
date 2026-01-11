/**
 * NetworkError Page
 * Issue #368: Error Boundary System
 */

import React from 'react';

const NetworkError = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-lg">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Connection Issues</h1>
                <p className="text-lg text-gray-600 mb-8">
                    It looks like you're offline or having trouble connecting to our servers.
                    Please check your internet connection and try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Check Connection
                </button>
            </div>
        </div>
    );
};

export default NetworkError;
