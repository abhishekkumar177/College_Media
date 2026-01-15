import React, { useState, useEffect } from 'react';
import {
  calculateContrastRatio,
  validateFormAccessibility,
  validateTouchTargets,
  announceToScreenReader
} from '../utils/accessibility';

/**
 * Accessibility Audit Component
 * Issue #246: WCAG 2.1 AA compliance auditing tool
 */
const AccessibilityAudit = ({ onAuditComplete }) => {
  const [auditResults, setAuditResults] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAccessibilityAudit = async () => {
    setIsAuditing(true);
    announceToScreenReader('Starting accessibility audit', 'polite');

    const results = {
      timestamp: new Date().toISOString(),
      contrast: [],
      forms: [],
      touchTargets: [],
      overall: { score: 0, totalChecks: 0, passed: 0, failed: 0 }
    };

    // Contrast ratio audit
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        try {
          const ratio = calculateContrastRatio(color, backgroundColor);
          if (ratio < 4.5) {
            results.contrast.push({
              element: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : ''),
              ratio: ratio.toFixed(2),
              required: '4.5:1',
              status: 'fail'
            });
          } else {
            results.contrast.push({
              element: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : ''),
              ratio: ratio.toFixed(2),
              required: '4.5:1',
              status: 'pass'
            });
          }
        } catch (_) {
          // Skip invalid colors
        }
      }
    });

    // Form accessibility audit
    const forms = document.querySelectorAll('form');
    forms.forEach((form, index) => {
      const validation = validateFormAccessibility(form);
      results.forms.push({
        form: `Form ${index + 1}`,
        valid: validation.valid,
        issues: validation.issues
      });
    });

    // Touch target audit
    const touchValidation = validateTouchTargets();
    results.touchTargets = touchValidation.issues;

    // Calculate overall score
    const allChecks = [
      ...results.contrast,
      ...results.forms.map(f => ({ status: f.valid ? 'pass' : 'fail' })),
      ...results.touchTargets.map(() => ({ status: 'fail' }))
    ];

    results.overall.totalChecks = allChecks.length;
    results.overall.passed = allChecks.filter(check => check.status === 'pass').length;
    results.overall.failed = allChecks.filter(check => check.status === 'fail').length;
    results.overall.score = Math.round((results.overall.passed / results.overall.totalChecks) * 100);

    setAuditResults(results);
    setIsAuditing(false);

    announceToScreenReader(`Accessibility audit complete. Score: ${results.overall.score}%`, 'polite');

    if (onAuditComplete) {
      onAuditComplete(results);
    }
  };

  useEffect(() => {
    // Auto-run audit on mount for development
    if (process.env.NODE_ENV === 'development') {
      runAccessibilityAudit();
    }
  }, []); // runAccessibilityAudit is stable, no need to include

  return (
    <div className="accessibility-audit p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Accessibility Audit (WCAG 2.1 AA)
      </h2>

      <button
        onClick={runAccessibilityAudit}
        disabled={isAuditing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
        aria-describedby="audit-button-description"
      >
        {isAuditing ? 'Running Audit...' : 'Run Accessibility Audit'}
      </button>
      <div id="audit-button-description" className="sr-only">
        Runs automated accessibility checks for color contrast, form accessibility, and touch targets
      </div>

      {auditResults && (
        <div className="audit-results space-y-6">
          {/* Overall Score */}
          <div className="overall-score p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Overall Score: {auditResults.overall.score}%
            </h3>
            <div className="flex space-x-4 text-sm">
              <span className="text-green-600">Passed: {auditResults.overall.passed}</span>
              <span className="text-red-600">Failed: {auditResults.overall.failed}</span>
              <span className="text-gray-600">Total: {auditResults.overall.totalChecks}</span>
            </div>
          </div>

          {/* Contrast Issues */}
          {auditResults.contrast.filter(item => item.status === 'fail').length > 0 && (
            <div className="contrast-issues">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Color Contrast Issues
              </h3>
              <ul className="space-y-1">
                {auditResults.contrast
                  .filter(item => item.status === 'fail')
                  .slice(0, 10)
                  .map((item, index) => (
                    <li key={index} className="text-red-600 text-sm">
                      {item.element}: {item.ratio}:1 (requires {item.required})
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Form Issues */}
          {auditResults.forms.filter(form => !form.valid).length > 0 && (
            <div className="form-issues">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Form Accessibility Issues
              </h3>
              <ul className="space-y-1">
                {auditResults.forms
                  .filter(form => !form.valid)
                  .map((form, index) => (
                    <li key={index} className="text-red-600 text-sm">
                      {form.form}: {form.issues.join(', ')}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Touch Target Issues */}
          {auditResults.touchTargets.length > 0 && (
            <div className="touch-issues">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Touch Target Issues
              </h3>
              <ul className="space-y-1">
                {auditResults.touchTargets.slice(0, 10).map((issue, index) => (
                  <li key={index} className="text-red-600 text-sm">
                    {issue.element.tagName}.{issue.element.className}: {issue.issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessibilityAudit;