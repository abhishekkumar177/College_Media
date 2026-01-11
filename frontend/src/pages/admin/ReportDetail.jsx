import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { useReportDetails, useModerationActions } from '../../hooks/useModeration';
import {
  REPORT_REASON_LABELS,
  REPORT_REASON_ICONS,
  REPORT_STATUS_LABELS,
  REPORT_CONTENT_TYPE_LABELS,
  getModerationActionOptions,
} from '../../utils/reportReasons';

/**
 * ReportDetail Component
 * Detailed view of a single report with action capabilities
 */
const ReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { report, loading, loadDetails } = useReportDetails(reportId);
  const { performAction, isProcessing } = useModerationActions();
  const [selectedAction, setSelectedAction] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);

  const actionOptions = getModerationActionOptions();

  useEffect(() => {
    if (reportId) {
      loadDetails();
    }
  }, [reportId]);

  const handleTakeAction = async () => {
    if (!selectedAction) return;

    const confirmed = window.confirm(
      `Are you sure you want to take this action: ${selectedAction.replace('_', ' ')}?`
    );

    if (confirmed) {
      try {
        await performAction(reportId, selectedAction, actionNotes);
        setShowActionModal(false);
        loadDetails(); // Reload report details
      } catch (error) {
        console.error('Action failed:', error);
      }
    }
  };

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:loading" className="w-12 h-12 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:alert-circle" className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400 mt-4">Report not found</p>
          <Link
            to="/admin/moderation"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
          >
            <Icon icon="mdi:arrow-left" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            to="/admin/moderation"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4"
          >
            <Icon icon="mdi:arrow-left" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Report Details
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Report Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon icon={REPORT_REASON_ICONS[report.reason]} className="w-6 h-6 text-gray-600 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {REPORT_REASON_LABELS[report.reason]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon icon="mdi:file-document-outline" className="w-6 h-6 text-gray-600 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Content Type</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {REPORT_CONTENT_TYPE_LABELS[report.contentType]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon icon="mdi:calendar" className="w-6 h-6 text-gray-600 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reported On</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {format(new Date(report.createdAt), 'PPpp')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon icon="mdi:counter" className="w-6 h-6 text-gray-600 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Report Count</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {report.reportCount || 1} {report.reportCount > 1 ? 'reports' : 'report'}
                    </p>
                  </div>
                </div>

                {report.details && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Additional Details</p>
                    <p className="text-base text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {report.details}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Preview Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reported Content
              </h2>
              
              {report.content ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {report.content.text || report.content.caption || 'No text content'}
                  </p>
                  {report.content.image && (
                    <img
                      src={report.content.image}
                      alt="Reported content"
                      className="mt-4 rounded-lg max-w-full"
                    />
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Content preview not available</p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`/${report.contentType}/${report.contentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <Icon icon="mdi:open-in-new" />
                  View Original Content
                </a>
              </div>
            </div>

            {/* Action History */}
            {report.actionHistory && report.actionHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Action History
                </h2>
                <div className="space-y-3">
                  {report.actionHistory.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Icon icon="mdi:history" className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {action.action.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(action.timestamp), 'PPpp')}
                        </p>
                        {action.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {action.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status
              </h2>
              <div className="text-center">
                <span className="inline-flex px-4 py-2 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  {REPORT_STATUS_LABELS[report.status]}
                </span>
              </div>
            </div>

            {/* Actions Card */}
            {report.status === 'pending' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Take Action
                </h2>
                
                <div className="space-y-2">
                  {actionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedAction(option.value);
                        setShowActionModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                      <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Owner Info */}
            {report.contentOwner && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Content Owner
                </h2>
                <div className="flex items-center gap-3">
                  <img
                    src={report.contentOwner.avatar || '/default-avatar.png'}
                    alt={report.contentOwner.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {report.contentOwner.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{report.contentOwner.username}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/profile/${report.contentOwner.username}`}
                  className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                >
                  View Profile
                  <Icon icon="mdi:arrow-right" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Confirm Action
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You are about to: <strong>{selectedAction.replace('_', ' ')}</strong>
              </p>
              
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add notes for this action (optional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTakeAction}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
