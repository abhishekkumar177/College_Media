import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { performanceMonitor } from "../utils/performanceMonitor.js";
import AppRoutes from "../routes/AppRoutes.jsx";
import { AppProviders } from "./AppProviders.jsx";
import { useWebVitals, reportWebVitals } from "../hooks/useWebVitals.js";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts.js";
import KeyboardShortcutsHelp from "../components/KeyboardShortcutsHelp.jsx";
import { useTheme } from "../context/ThemeContext.jsx";


const App = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const layoutState = {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
  };

  useWebVitals(reportWebVitals);

  useEffect(() => {
    performanceMonitor.mark("app-init");

    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then((registration) => {
          console.log("[SW] Registered:", registration);
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
        });
    }

    // Measure app load time
    window.addEventListener("load", () => {
      performanceMonitor.mark("app-loaded");
      performanceMonitor.measure("app-load-time", "app-init", "app-loaded");
      performanceMonitor.report();
    });
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh' }}>
      <AppProviders>
        <AppContent layoutState={layoutState} />
      </AppProviders>
    </div>
  );
};

// Separate component to use hooks that depend on context
const AppContent = ({ layoutState }) => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Global keyboard shortcuts
  const globalShortcuts = {
    'g h': () => navigate('/'),
    'g p': () => navigate('/profile'),
    'g m': () => navigate('/messages'),
    'g n': () => navigate('/notifications'),
    '?': () => setShowShortcutsHelp(true),
    't': () => toggleTheme(),
    '/': (e) => {
      e.preventDefault();
      document.querySelector('input[type="text"]')?.focus();
    }
  };

  useKeyboardShortcuts(globalShortcuts, {
    enabled: !showShortcutsHelp,
    excludeInputs: true
  });

  return (
    <>
      <AppRoutes props={layoutState} />
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </>
  );
};

export default App;
