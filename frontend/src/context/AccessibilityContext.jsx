import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Exported for use with useContext(AccessibilityContext)
export const AccessibilityContext = createContext();

// Custom hook for consuming accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  // 1. SSR-Safe Initialization
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    keyboardOnly: false,
  });

  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [progressIndicators, setProgressIndicators] = useState({});

  // 2. Load preferences on Mount only (Client-side)
  useEffect(() => {
    const saved = localStorage.getItem('a11y-preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    } else {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setPreferences(prev => ({ ...prev, reducedMotion: prefersReduced }));
    }
  }, []);

  // 3. Sync Preferences to DOM and LocalStorage
  useEffect(() => {
    localStorage.setItem('a11y-preferences', JSON.stringify(preferences));
    
    const root = document.documentElement;
    root.classList.toggle('reduced-motion', preferences.reducedMotion);
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('large-text', preferences.largeText);
    root.classList.toggle('keyboard-only', preferences.keyboardOnly);
  }, [preferences]);

  // 4. Keyboard Usage Detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') setPreferences(prev => ({ ...prev, keyboardOnly: true }));
    };
    const handleMouseDown = () => {
      setPreferences(prev => ({ ...prev, keyboardOnly: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // 5. Robust Announcement Handler
  const announce = useCallback((message, priority = 'polite') => {
    const setter = priority === 'assertive' ? setAssertiveMessage : setPoliteMessage;
    
    // Clear first to ensure screen reader detects a change even if message is identical
    setter(''); 
    setTimeout(() => {
      setter(message);
    }, 50);

    // Auto-clear after reading to prevent "stale" content in DOM
    setTimeout(() => {
      setter('');
    }, 5000);
  }, []);

  // 6. Form Validation Feedback
  const setFieldError = useCallback((fieldId, error) => {
    setFormErrors(prev => ({
      ...prev,
      [fieldId]: error
    }));

    if (error) {
      announce(error, 'assertive');
    }
  }, [announce]);

  const clearFieldError = useCallback((fieldId) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  const getFieldError = useCallback((fieldId) => {
    return formErrors[fieldId] || null;
  }, [formErrors]);

  // 7. Progress Indicator Management
  const createProgressIndicator = useCallback((id, options = {}) => {
    const indicator = {
      id,
      value: options.initialValue || 0,
      max: options.max || 100,
      label: options.label || 'Loading...',
      showPercentage: options.showPercentage !== false,
      created: Date.now()
    };

    setProgressIndicators(prev => ({
      ...prev,
      [id]: indicator
    }));

    announce(`${indicator.label} started`, 'polite');

    return id;
  }, [announce]);

  const updateProgressIndicator = useCallback((id, value) => {
    setProgressIndicators(prev => {
      if (!prev[id]) return prev;

      const updated = { ...prev[id], value };
      announce(`${updated.label} ${updated.showPercentage ? value + '%' : 'updated'}`, 'polite');

      return {
        ...prev,
        [id]: updated
      };
    });
  }, [announce]);

  const removeProgressIndicator = useCallback((id) => {
    setProgressIndicators(prev => {
      if (!prev[id]) return prev;

      announce(`${prev[id].label} completed`, 'polite');

      const newIndicators = { ...prev };
      delete newIndicators[id];
      return newIndicators;
    });
  }, [announce]);

  const getProgressIndicator = useCallback((id) => {
    return progressIndicators[id] || null;
  }, [progressIndicators]);

  // Memoize value to prevent unnecessary re-renders of all consumers
  const contextValue = useMemo(() => ({
    preferences,
    updatePreference,
    announce,
    formErrors,
    setFieldError,
    clearFieldError,
    getFieldError,
    progressIndicators,
    createProgressIndicator,
    updateProgressIndicator,
    removeProgressIndicator,
    getProgressIndicator
  }), [
    preferences,
    updatePreference,
    announce,
    formErrors,
    setFieldError,
    clearFieldError,
    getFieldError,
    progressIndicators,
    createProgressIndicator,
    updateProgressIndicator,
    removeProgressIndicator,
    getProgressIndicator
  ]);

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Live Regions: Must remain in DOM at all times. 
          Only the inner text should change to trigger the Screen Reader. 
      */}
      <div className="sr-only" style={srOnlyStyle}>
        <div 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {politeMessage}
        </div>
        <div 
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          {assertiveMessage}
        </div>
      </div>
    </AccessibilityContext.Provider>
  );
};

// CSS-in-JS fallback for sr-only if the global class is missing
const srOnlyStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
};