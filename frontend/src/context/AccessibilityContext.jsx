import { createContext, useState, useEffect, useCallback, useMemo } from 'react';

// Exported for use with useContext(AccessibilityContext)
export const AccessibilityContext = createContext();

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

  // Memoize value to prevent unnecessary re-renders of all consumers
  const contextValue = useMemo(() => ({
    preferences,
    updatePreference,
    announce
  }), [preferences, updatePreference, announce]);

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