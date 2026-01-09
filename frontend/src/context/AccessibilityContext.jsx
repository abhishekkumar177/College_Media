/**
 * Accessibility Context - WCAG 2.1 AA Compliance
 * Issue #246: A11y Provider for user preferences
 */

import { createContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();


export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('a11y-preferences');
    return saved ? JSON.parse(saved) : {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: false,
      largeText: false,
      keyboardOnly: false,
    };
  });

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    localStorage.setItem('a11y-preferences', JSON.stringify(preferences));
    
    // Apply preferences to document
    document.documentElement.classList.toggle('reduced-motion', preferences.reducedMotion);
    document.documentElement.classList.toggle('high-contrast', preferences.highContrast);
    document.documentElement.classList.toggle('large-text', preferences.largeText);
    document.documentElement.classList.toggle('keyboard-only', preferences.keyboardOnly);
  }, [preferences]);

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setPreferences(prev => ({ ...prev, keyboardOnly: true }));
      }
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

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const announce = (message, priority = 'polite') => {
    setAnnouncements(prev => [...prev, { id: Date.now(), message, priority }]);
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 3000);
  };

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference, announce }}>
      {children}
      {/* Live Region for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcements.filter(a => a.priority === 'polite').map(a => (
          <div key={a.id}>{a.message}</div>
        ))}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {announcements.filter(a => a.priority === 'assertive').map(a => (
          <div key={a.id}>{a.message}</div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  );
};
