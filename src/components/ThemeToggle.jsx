import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center gap-2 px-3 py-2 rounded-full border bg-white/80 text-slate-700 shadow-sm hover:shadow-md transition-all backdrop-blur dark:bg-slate-800/80 dark:text-slate-100 dark:border-slate-700 ${className}`}
    >
      <span className="text-lg" aria-hidden>
        {isDark ? '☀️' : '🌙'}
      </span>
      <span className="hidden sm:inline text-xs font-semibold tracking-tight">
        {isDark ? 'Light' : 'Dark'} mode
      </span>
    </button>
  );
};

export default ThemeToggle;
