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
import { SocketProvider } from "./context/SocketContext.jsx";
import { AccessibilityProvider } from "./context/AccessibilityContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { PollProvider } from "./context/PollContext.jsx";
import { register as registerServiceWorker } from "./utils/serviceWorkerRegistration";
import "./index.css";
import "./styles/accessibility.css";
import App from "./app/App.jsx";

// Register service worker for PWA only in production
if (import.meta.env.PROD) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider> 
              <ThemeProvider>
                <BookmarkProvider>
                  <PollProvider>
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </PollProvider>
                </BookmarkProvider>
              </ThemeProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </HelmetProvider>
  </StrictMode>
);