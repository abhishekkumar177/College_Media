import { useEffect } from "react";
import { performanceMonitor } from "./utils/performanceMonitor.js";

export function useAppPerformance() {
  useEffect(() => {
    performanceMonitor.mark("app-init");

    window.addEventListener("load", () => {
      performanceMonitor.mark("app-loaded");
      performanceMonitor.measure("app-load-time", "app-init", "app-loaded");
      performanceMonitor.report();
    });
  }, []);
}