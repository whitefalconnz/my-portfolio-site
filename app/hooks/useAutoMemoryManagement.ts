import { useEffect, useRef, useCallback } from 'react';
import { 
  trackImageForMemoryManagement, 
  stopTrackingImage, 
  clearAllTracking, 
  getTrackingStats 
} from '../utils/memoryManager';

interface UseAutoMemoryManagementOptions {
  enabled?: boolean;
  debugLog?: boolean;
}

/**
 * Custom hook for automatic memory management of images, videos, and iframes
 * Automatically tracks elements and removes them from memory when out of view for 10 seconds
 */
export const useAutoMemoryManagement = (options: UseAutoMemoryManagementOptions = {}) => {
  const { enabled = true, debugLog = false } = options;
  const trackedElements = useRef<Set<string>>(new Set());
  const isTrackingEnabled = useRef(enabled);

  // Update tracking enabled state
  useEffect(() => {
    isTrackingEnabled.current = enabled;
  }, [enabled]);

  /**
   * Track a single element for automatic memory management
   */
  const trackElement = useCallback((
    element: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement,
    customKey?: string
  ): string | null => {
    if (!isTrackingEnabled.current || !element) return null;

    try {
      const key = trackImageForMemoryManagement(element, customKey);
      trackedElements.current.add(key);
      
      if (debugLog) {
        console.log(`🎯 Auto-tracking element: ${key}`);
      }
      
      return key;
    } catch (error) {
      console.warn('Failed to track element for memory management:', error);
      return null;
    }
  }, [debugLog]);

  /**
   * Stop tracking a specific element
   */
  const stopTracking = useCallback((key: string) => {
    if (trackedElements.current.has(key)) {
      stopTrackingImage(key);
      trackedElements.current.delete(key);
      
      if (debugLog) {
        console.log(`🛑 Stopped auto-tracking: ${key}`);
      }
    }
  }, [debugLog]);

  /**
   * Track all images, videos, and iframes within a container
   */
  const trackElementsInContainer = useCallback((
    container: HTMLElement | null,
    selector?: string
  ): string[] => {
    if (!isTrackingEnabled.current || !container) return [];

    const defaultSelector = 'img, video, iframe';
    const elements = container.querySelectorAll(selector || defaultSelector);
    const trackedKeys: string[] = [];

    elements.forEach((element, index) => {
      if (
        element instanceof HTMLImageElement ||
        element instanceof HTMLVideoElement ||
        element instanceof HTMLIFrameElement
      ) {
        // Create a key based on element properties and index
        const elementType = element.tagName.toLowerCase();
        const customKey = `${elementType}-${index}-${Date.now()}`;
        
        const key = trackElement(element, customKey);
        if (key) {
          trackedKeys.push(key);
        }
      }
    });

    if (debugLog) {
      console.log(`📋 Auto-tracked ${trackedKeys.length} elements in container`);
    }

    return trackedKeys;
  }, [trackElement, debugLog]);

  /**
   * Get current tracking statistics
   */
  const getStats = useCallback(() => {
    const stats = getTrackingStats();
    const ourTrackedCount = trackedElements.current.size;
    
    return {
      ...stats,
      ourTrackedCount,
    };
  }, []);

  /**
   * Log current tracking stats (useful for debugging)
   */
  const logStats = useCallback(() => {
    const stats = getStats();
    console.log('📊 Auto Memory Management Stats:', stats);
  }, [getStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop tracking all elements we started tracking
      trackedElements.current.forEach((key) => {
        stopTrackingImage(key);
      });
      trackedElements.current.clear();
      
      if (debugLog) {
        console.log('🧹 Cleaned up auto memory management tracking');
      }
    };
  }, [debugLog]);

  // Development helper - expose stats on window object
  useEffect(() => {
    if (debugLog && typeof window !== 'undefined') {
      (window as any).getMemoryTrackingStats = getStats;
      (window as any).logMemoryTrackingStats = logStats;
    }
  }, [debugLog, getStats, logStats]);

  return {
    trackElement,
    stopTracking,
    trackElementsInContainer,
    getStats,
    logStats,
    isEnabled: isTrackingEnabled.current,
  };
};

/**
 * Hook specifically for tracking images in a component
 * Automatically finds and tracks all img elements in the component
 */
export const useAutoImageTracking = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseAutoMemoryManagementOptions & { 
    selector?: string;
    trackOnMount?: boolean;
    retryInterval?: number;
  } = {}
) => {
  const { 
    enabled = true, 
    debugLog = false, 
    selector = 'img, video, iframe',
    trackOnMount = true,
    retryInterval = 1000
  } = options;
  
  const { trackElementsInContainer, stopTracking, getStats } = useAutoMemoryManagement({ 
    enabled, 
    debugLog 
  });
  
  const trackedInThisComponent = useRef<string[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const trackAllElements = useCallback(() => {
    if (!containerRef.current) return;

    // Stop tracking previous elements
    trackedInThisComponent.current.forEach(key => stopTracking(key));
    trackedInThisComponent.current = [];

    // Track new elements
    const newKeys = trackElementsInContainer(containerRef.current, selector);
    trackedInThisComponent.current = newKeys;

    if (debugLog) {
      console.log(`🎯 Component auto-tracked ${newKeys.length} elements`);
    }

    // If no elements found and trackOnMount is true, retry after a short delay
    // This handles cases where images load asynchronously
    if (newKeys.length === 0 && trackOnMount) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      retryTimeoutRef.current = setTimeout(() => {
        const retryKeys = trackElementsInContainer(containerRef.current, selector);
        trackedInThisComponent.current.push(...retryKeys);
        
        if (debugLog && retryKeys.length > 0) {
          console.log(`🔄 Component retry-tracked ${retryKeys.length} elements`);
        }
      }, retryInterval);
    }
  }, [containerRef, trackElementsInContainer, stopTracking, selector, debugLog, trackOnMount, retryInterval]);

  // Track elements when container becomes available
  useEffect(() => {
    if (trackOnMount && containerRef.current) {
      trackAllElements();
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [trackOnMount, trackAllElements]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      trackedInThisComponent.current.forEach(key => stopTracking(key));
      trackedInThisComponent.current = [];
    };
  }, [stopTracking]);

  return {
    trackAllElements,
    getStats,
    trackedCount: trackedInThisComponent.current.length,
  };
}; 