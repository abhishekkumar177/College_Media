/**
 * NotFound Page (404)
 * Issue #368: Error Boundary System
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-lg">
                <h1 className="text-9xl font-bold text-indigo-100">404</h1>
                <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6">Page Not Found</h2>
                <p className="text-lg text-gray-600 mb-8">
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
