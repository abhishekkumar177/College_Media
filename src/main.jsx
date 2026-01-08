/**
 * College Media - Application Entry Point
 * * - Removed ThemeProvider from here to avoid duplicate context providers.
 * - App.jsx handles the global providers.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { BookmarkProvider } from "./context/BookmarkContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <BookmarkProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </BookmarkProvider>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
