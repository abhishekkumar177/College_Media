/**
 * College Media - Application Entry Point
 * 
 * This file serves as the main entry point for the React application.
 * It initializes the React root and mounts the main App component into
 * the DOM. StrictMode is enabled to highlight potential issues during development.
 * 
 * @file Main application bootstrap
 * @requires react - React library
 * @requires react-dom - React DOM rendering library
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Initialize and render the React application
 * 
 * - Finds the root DOM element (id="root" in index.html)
 * - Creates a React root to enable concurrent features
 * - Wraps App with StrictMode for development warnings
 * - StrictMode catches common React errors during development
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
