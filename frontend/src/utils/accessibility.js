/**
 * Accessibility Utilities
 * Issue #246: WCAG 2.1 AA helper functions
 */

/**
 * Check if color contrast meets WCAG AA standards (4.5:1)
 */
export const calculateContrastRatio = (color1, color2) => {
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = ((rgb >> 0) & 0xff) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Generate accessible alt text for images
 */
export const generateAltText = (filename, caption) => {
  if (caption) return caption;
  const cleanName = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').replace(/[-_]/g, ' ');
  return `Image: ${cleanName}`;
};

/**
 * Check if element is keyboard accessible
 */
export const isKeyboardAccessible = (element) => {
  const tabindex = element.getAttribute('tabindex');
  const isInteractive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
  return isInteractive || (tabindex !== null && tabindex !== '-1');
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 3000);
};

/**
 * Get accessible label for element
 */
export const getAccessibleLabel = (element) => {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent ||
    element.getAttribute('title') ||
    element.getAttribute('alt')
  );
};

/**
 * Validate form accessibility
 */
export const validateFormAccessibility = (formElement) => {
  const issues = [];

  // Check all inputs have labels
  const inputs = formElement.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const id = input.id;
    const label = formElement.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');

    if (!label && !ariaLabel) {
      issues.push(`Input missing label: ${input.name || input.type}`);
    }
  });

  // Check submit button is accessible
  const submitButton = formElement.querySelector('[type="submit"]');
  if (submitButton && !getAccessibleLabel(submitButton)) {
    issues.push('Submit button missing accessible label');
  }

  return { valid: issues.length === 0, issues };
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers dark mode
 */
export const prefersDarkMode = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Create accessible error message
 */
export const createErrorMessage = (fieldName, error) => {
  return {
    id: `${fieldName}-error`,
    role: 'alert',
    'aria-live': 'assertive',
    message: error,
  };
};

/**
 * Enhanced form validation with accessibility feedback
 */
export const validateFieldAccessibility = (fieldElement, value, rules = {}) => {
  const errors = [];
  const fieldName = fieldElement.name || fieldElement.id || 'field';

  // Required field validation
  if (rules.required && (!value || value.trim() === '')) {
    errors.push(`${fieldName} is required`);
  }

  // Length validation
  if (rules.minLength && value && value.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
  }

  if (rules.maxLength && value && value.length > rules.maxLength) {
    errors.push(`${fieldName} must be no more than ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && value && !rules.pattern.test(value)) {
    errors.push(rules.patternMessage || `${fieldName} format is invalid`);
  }

  // Update field accessibility attributes
  const errorId = `${fieldElement.id || fieldElement.name}-error`;
  fieldElement.setAttribute('aria-invalid', errors.length > 0 ? 'true' : 'false');

  if (errors.length > 0) {
    fieldElement.setAttribute('aria-describedby', errorId);
  } else {
    fieldElement.removeAttribute('aria-describedby');
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorId,
    errorMessage: errors.join('. ')
  };
};

/**
 * Create progress indicator with accessibility
 */
export const createProgressIndicator = (container, options = {}) => {
  const {
    label = 'Loading...',
    value = 0,
    max = 100,
    showPercentage = true
  } = options;

  const progressContainer = document.createElement('div');
  progressContainer.setAttribute('role', 'progressbar');
  progressContainer.setAttribute('aria-valuenow', value);
  progressContainer.setAttribute('aria-valuemin', '0');
  progressContainer.setAttribute('aria-valuemax', max);
  progressContainer.setAttribute('aria-label', label);

  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.width = `${(value / max) * 100}%`;

  const labelElement = document.createElement('span');
  labelElement.className = 'sr-only';
  labelElement.textContent = showPercentage ? `${label} ${value}%` : label;

  progressContainer.appendChild(progressBar);
  progressContainer.appendChild(labelElement);

  if (container) {
    container.appendChild(progressContainer);
  }

  return {
    container: progressContainer,
    update: (newValue) => {
      progressContainer.setAttribute('aria-valuenow', newValue);
      progressBar.style.width = `${(newValue / max) * 100}%`;
      if (showPercentage) {
        labelElement.textContent = `${label} ${newValue}%`;
      }
    },
    remove: () => {
      if (progressContainer.parentNode) {
        progressContainer.parentNode.removeChild(progressContainer);
      }
    }
  };
};

/**
 * Announce form validation results
 */
export const announceFormValidation = (formElement, validationResults) => {
  const totalErrors = validationResults.reduce((sum, result) => sum + result.errors.length, 0);

  if (totalErrors === 0) {
    announceToScreenReader('Form validation successful', 'polite');
  } else {
    announceToScreenReader(`Form has ${totalErrors} error${totalErrors > 1 ? 's' : ''}. Please review and correct the highlighted fields.`, 'assertive');
  }
};

/**
 * Check touch target accessibility (minimum 44x44px)
 */
export const validateTouchTargets = (container = document) => {
  const issues = [];
  const interactiveElements = container.querySelectorAll('button, a, [role="button"], input[type="submit"], input[type="button"]');

  interactiveElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    const width = rect.width + parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    const height = rect.height + parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);

    if (width < 44 || height < 44) {
      issues.push({
        element,
        issue: `Touch target too small: ${Math.round(width)}x${Math.round(height)}px (minimum 44x44px required)`,
        dimensions: { width: Math.round(width), height: Math.round(height) }
      });
    }
  });

  return { valid: issues.length === 0, issues };
};
