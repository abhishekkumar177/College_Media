import { useState, useEffect } from "react";
import "../App.css";
import { performanceMonitor } from "../utils/performanceMonitor.js";
import AppRoutes from "../routes/AppRoutes.jsx";
import { AppProviders } from "./AppProviders.jsx";
import { useWebVitals, reportWebVitals } from "../hooks/useWebVitals.js";


const App = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

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
    <AppProviders>

      <AppRoutes props={layoutState} />

    </AppProviders>
  );
};

export default App;
