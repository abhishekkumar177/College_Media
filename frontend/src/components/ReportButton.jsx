import { useState } from 'react';
import { Icon } from '@iconify/react';
import ReportModal from './ReportModal';

/**
 * ReportButton Component
 * Trigger button to open report modal
 * Can be used in post menus, comment menus, profile pages, etc.
 */
const ReportButton = ({ contentType, contentId, contentOwnerId, onReportSubmitted }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSuccess = () => {
    setShowModal(false);
    if (onReportSubmitted) {
      onReportSubmitted();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 w-full text-left transition-colors rounded-lg"
        title="Report this content"
      >
        <Icon icon="mdi:flag-outline" className="w-5 h-5" />
        <span>Report</span>
      </button>

      {showModal && (
        <ReportModal
          contentType={contentType}
          contentId={contentId}
          contentOwnerId={contentOwnerId}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default ReportButton;
