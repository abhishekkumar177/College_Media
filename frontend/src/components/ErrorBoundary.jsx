/**
 * ErrorBoundary Component
 * Issue #368: Error Boundary System
 * 
 * Global error boundary that catches JavaScript errors in the component tree.
 * Provides specific error UI for different error types and recovery options.
 */

import React from 'react';
import { AlertCircle, RefreshCw, Home, WifiOff, FileWarning } from 'lucide-react';
import { logError } from '../utils/errorLogger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      isNetworkError: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Check if it looks like a network error
    const isNetworkError = error.message && (
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('network')
    );

    return {
      hasError: true,
      isNetworkError
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    logError(error, errorInfo);

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      isApiError,
      isRetryable,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isNetworkError: false,
    });

    // Optional: Call a prop to reset parent state
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount, isNetworkError } = this.state;
      const isDevelopment = import.meta.env.MODE === 'development';
      const { fallback } = this.props;

      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback({ error, resetErrorBoundary: this.handleReset });
      }

      // Customize content based on error type
      const errorTitle = isNetworkError ? 'Connection Issue' : 'Oops! Something went wrong';
      const errorMessage = isNetworkError
        ? 'It seems you are offline or having trouble connecting to the server.'
        : 'We apologize for the inconvenience. Our team has been notified.';

      const Icon = isNetworkError ? WifiOff : AlertCircle;
      const headerColor = isNetworkError ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-orange-500';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className={`bg-gradient-to-r ${headerColor} p-8 text-white transition-colors duration-300`}>
              <div className="flex items-center gap-4">
                <Icon className="w-12 h-12" />
                <div>
                  <h1 className="text-3xl font-bold">{errorTitle}</h1>
                  <p className="text-white/90 mt-2">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {errorCount > 3 && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <div className="flex gap-2">
                    <FileWarning className="w-5 h-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">
                      Multiple errors detected. Proper recovery might require a page refresh.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    Suggested Actions
                  </h2>
                  <ul className="space-y-3 text-gray-600 bg-gray-50 p-4 rounded-xl">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Try refreshing the page
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {isNetworkError ? 'Check your internet connection' : 'Go back to the home page'}
                    </li>
                    {!isNetworkError && (
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Try again in a few minutes
                      </li>
                    )}
                  </ul>
                </div>

                {/* API Error Specific Guidance */}
                {this.state.isApiError && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="flex items-start gap-2">
                      <Wifi className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">
                          {this.state.isRetryable
                            ? 'Connection Issue Detected'
                            : 'API Error Occurred'}
                        </p>
                        <p className="text-blue-700 text-sm mt-1">
                          {this.state.isRetryable
                            ? 'This appears to be a temporary connection issue. Retrying may resolve the problem.'
                            : 'Please check your internet connection and try again.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <Home className="w-5 h-5" />
                    Go Home
                  </button>
                </div>

                {/* Development Mode Error Details */}
                {isDevelopment && error && (
                  <div className="mt-8 border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Developer Details
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        DEV MODE ONLY
                      </span>
                    </div>

                    <div className="bg-gray-900 rounded-lg overflow-hidden text-gray-300 font-mono text-xs">
                      <div className="p-4 border-b border-gray-700 bg-gray-800">
                        <p className="text-red-400 font-bold break-all">
                          {error.toString()}
                        </p>
                      </div>
                      {errorInfo && (
                        <div className="p-4 max-h-64 overflow-y-auto custom-scrollbar">
                          <pre className="whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t flex justify-between items-center text-xs text-gray-500">
              <p>Error ID: {Date.now().toString(36).toUpperCase()}</p>
              {errorCount > 1 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Occurrence: {errorCount}</span>}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
