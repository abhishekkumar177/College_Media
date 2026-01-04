/**
 * College Media - Application Entry Point
 * 
 * This file serves as the main entry point for the React application.
 * It initializes the React root and mounts the main App component into
 * the DOM. StrictMode is enabled to highlight potential issues during development.
 * HelmetProvider wraps the app to enable SEO meta tag management.
 * 
 * @file Main application bootstrap
 * @requires react - React library
 * @requires react-dom - React DOM rendering library
 * @requires react-helmet-async - SEO meta tags management
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

/**
 * Initialize and render the React application
 * 
 * - Finds the root DOM element (id="root" in index.html)
 * - Creates a React root to enable concurrent features
 * - Wraps App with StrictMode for development warnings
 * - Wraps with HelmetProvider for SEO meta tag management
 * - StrictMode catches common React errors during development
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
        <App />
    </HelmetProvider>
  </StrictMode>,
)
