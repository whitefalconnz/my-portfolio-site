"use client";

import { useEffect, useState } from "react";
import { getTrackingStats, memoryManager } from "../../utils/memoryManager";

interface MemoryStatsDebuggerProps {
  show?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export default function MemoryStatsDebugger({
  show = process.env.NODE_ENV === "development",
  position = "bottom-right",
}: MemoryStatsDebuggerProps) {
  const [stats, setStats] = useState<any>(null);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!show) return;

    const updateStats = () => {
      const trackingStats = getTrackingStats();
      const memInfo = memoryManager.getMemoryInfo();

      setStats(trackingStats);
      setMemoryInfo(memInfo);
    };

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    updateStats(); // Initial update

    // Expose debugging functions globally
    if (typeof window !== "undefined") {
      (window as any).showMemoryStats = () => setIsVisible(true);
      (window as any).hideMemoryStats = () => setIsVisible(false);
      (window as any).toggleMemoryStats = () => setIsVisible((prev) => !prev);
      (window as any).getMemoryStats = () => ({
        tracking: getTrackingStats(),
        memory: memoryManager.getMemoryInfo(),
      });
      (window as any).logMemoryStats = () => {
        console.log("📊 Memory Management Stats:", {
          tracking: getTrackingStats(),
          memory: memoryManager.getMemoryInfo(),
        });
      };
    }

    return () => {
      clearInterval(interval);
    };
  }, [show]);

  // Return null to hide UI but keep functionality
  return null;
}
