/**
 * useWebVitals Hook - Performance metrics tracking
 * Issue #238: Performance Optimization - Web Vitals monitoring
 */

import { useEffect } from 'react';

export const useWebVitals = (callback) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamic import web-vitals only when needed
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(callback);
      onINP(callback); // INP replaced FID in web-vitals v3+
      onFCP(callback);
      onLCP(callback);
      onTTFB(callback);
    }).catch((err) => {
      console.error('Failed to load web-vitals:', err);
    });
  }, [callback]);
};

export const reportWebVitals = (metric) => {
  const { name, value, id } = metric;
  console.log(`[Web Vitals] ${name}:`, {
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    id,
    timestamp: Date.now(),
  });

  // Send to analytics if available
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }
};
