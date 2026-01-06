import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    console.log('Initializing theme, saved theme:', savedTheme);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to light mode
    return false;
  });

  // Initial setup on mount
  useEffect(() => {
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Update localStorage and DOM when theme changes
    const htmlElement = document.documentElement;
    console.log('Theme changed, isDarkMode:', isDarkMode);
    
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Applied dark mode');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Applied light mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    console.log('Toggle theme clicked, current mode:', isDarkMode);
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
