/**
 * ServerError Page (500)
 * Issue #368: Error Boundary System
 */

import React from 'react';
import { Link } from 'react-router-dom';

const ServerError = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-lg">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Internal Server Error</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Oops! Something went wrong on our end. We're working to fix it.
                    Please try again later.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Refresh Page
                    </button>
                    <Link
                        to="/"
                        className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ServerError;
