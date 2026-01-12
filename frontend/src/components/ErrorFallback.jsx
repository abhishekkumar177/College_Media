/**
 * ErrorFallback Component
 * Issue #368: Error Boundary System
 * 
 * User-friendly UI displayed when an error is caught by the Error Boundary.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        resetErrorBoundary();
        navigate('/');
        window.location.reload(); // Ensure a fresh start
    };

    const handleTryAgain = () => {
        resetErrorBoundary();
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div>
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                        <svg
                            className="h-10 w-10 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Something went wrong
                    </h2>
                    <p className="mt-4 text-sm text-gray-500">
                        We apologize for the inconvenience. An unexpected error has occurred.
                    </p>

                    {import.meta.env.DEV && error && (
                        <div className="mt-6 text-left bg-red-50 p-4 rounded-md overflow-auto max-h-48">
                            <p className="text-xs font-mono text-red-800 break-words">
                                {error.toString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <button
                        onClick={handleTryAgain}
                        className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={handleGoHome}
                        className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback;
