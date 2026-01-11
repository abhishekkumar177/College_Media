import React from 'react';
import { AlertCircle, RefreshCw, Home, Wifi } from 'lucide-react';
import { isRetryableError } from '../utils/apiErrorHandler';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      isApiError: false,
      isRetryable: false,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Check if this is an API error
    const isApiError = error.name?.includes('Error') &&
      (error.statusCode || error.response?.status);

    // Check if error is retryable
    const isRetryable = isApiError && isRetryableError(error);

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      isApiError,
      isRetryable,
    }));

    // Log to error reporting service (e.g., Sentry)
    if (window.errorReportingService) {
      window.errorReportingService.logError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const isDevelopment = import.meta.env.MODE === 'development';

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-12 h-12" />
                <div>
                  <h1 className="text-3xl font-bold">Oops! Something went wrong</h1>
                  <p className="text-red-100 mt-2">
                    We apologize for the inconvenience. Our team has been notified.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {errorCount > 3 && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-yellow-800 font-medium">
                    Multiple errors detected. You may want to refresh the entire page.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    What can you do?
                  </h2>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      Try refreshing the page
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      Go back to the home page
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      Clear your browser cache and cookies
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      Try again in a few minutes
                    </li>
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
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Home className="w-5 h-5" />
                    Go Home
                  </button>
                </div>

                {/* Development Mode Error Details */}
                {isDevelopment && error && (
                  <div className="mt-6 space-y-4">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-red-600 mb-3">
                        Error Details (Development Only)
                      </h3>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-red-800 mb-2">Error Message:</h4>
                        <p className="text-red-700 font-mono text-sm break-all">
                          {error.toString()}
                        </p>
                      </div>

                      {errorInfo && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Stack Trace:</h4>
                          <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
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
            <div className="bg-gray-50 px-8 py-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                Error ID: {Date.now().toString(36).toUpperCase()}
                {errorCount > 1 && ` • Occurrence: ${errorCount}`}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
