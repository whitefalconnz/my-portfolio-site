interface MediaElement {
  element: HTMLElement;
  originalSrc?: string;
  originalContent?: string;
  type: 'video' | 'iframe' | 'image' | 'background';
}

interface ViewportImageTracker {
  element: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement;
  originalSrc: string;
  timeoutId?: NodeJS.Timeout;
  isInViewport: boolean;
  observer?: IntersectionObserver;
}

class MemoryManager {
  private clearedElements: Map<string, MediaElement> = new Map();
  private isMemoryCleared = false;
  private viewportTrackers: Map<string, ViewportImageTracker> = new Map();
  private readonly OUT_OF_VIEW_DELAY = 10000; // 10 seconds

  /**
   * Starts tracking an image/video/iframe for automatic memory management
   */
  trackImageForMemoryManagement(
    element: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement,
    key?: string
  ): string {
    const trackingKey = key || this.generateKey(element);
    
    // Don't track if already being tracked
    if (this.viewportTrackers.has(trackingKey)) {
      return trackingKey;
    }

    // Don't track elements that are explicitly excluded
    if (element.dataset.excludeMemoryManagement === 'true') {
      console.log(`🚫 Skipping tracking for excluded element: ${trackingKey}`);
      return trackingKey;
    }

    const originalSrc = this.getElementSrc(element);
    if (!originalSrc) return trackingKey;

    // Create intersection observer for this element
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const tracker = this.viewportTrackers.get(trackingKey);
          if (!tracker) return;

          if (entry.isIntersecting) {
            // Element is in view - restore if needed and clear timeout
            this.handleElementInView(trackingKey, tracker);
          } else {
            // Element is out of view - start countdown
            this.handleElementOutOfView(trackingKey, tracker);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading slightly before entering viewport
        threshold: 0.1, // 10% of element must be visible
      }
    );

    // Start observing
    observer.observe(element);

    // Store tracking info
    this.viewportTrackers.set(trackingKey, {
      element,
      originalSrc,
      isInViewport: true, // Assume visible initially
      observer,
    });

    console.log(`🔍 Started tracking ${trackingKey} for memory management`);
    return trackingKey;
  }

  /**
   * Stops tracking an element
   */
  stopTrackingImage(key: string): void {
    const tracker = this.viewportTrackers.get(key);
    if (tracker) {
      tracker.observer?.disconnect();
      if (tracker.timeoutId) {
        clearTimeout(tracker.timeoutId);
      }
      this.viewportTrackers.delete(key);
      console.log(`🛑 Stopped tracking ${key}`);
    }
  }

  /**
   * Handle element coming into view
   */
  private handleElementInView(key: string, tracker: ViewportImageTracker): void {
    tracker.isInViewport = true;
    
    // Clear any pending timeout
    if (tracker.timeoutId) {
      clearTimeout(tracker.timeoutId);
      tracker.timeoutId = undefined;
    }

    // Restore element if it was cleared
    this.restoreElement(tracker.element, tracker.originalSrc);
  }

  /**
   * Handle element going out of view
   */
  private handleElementOutOfView(key: string, tracker: ViewportImageTracker): void {
    tracker.isInViewport = false;
    
    // Clear any existing timeout
    if (tracker.timeoutId) {
      clearTimeout(tracker.timeoutId);
    }

    // Set timeout to clear from memory
    tracker.timeoutId = setTimeout(() => {
      this.clearElementFromMemory(key, tracker);
    }, this.OUT_OF_VIEW_DELAY);

    console.log(`⏱️ Started 10s countdown for ${key}`);
  }

  /**
   * Clear an element from memory
   */
  private clearElementFromMemory(key: string, tracker: ViewportImageTracker): void {
    const { element } = tracker;
    
    try {
      if (element instanceof HTMLImageElement) {
        // Replace with tiny transparent placeholder
        element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+';
      } else if (element instanceof HTMLVideoElement) {
        // Pause and clear video source
        element.pause();
        element.removeAttribute('src');
        element.load();
      } else if (element instanceof HTMLIFrameElement) {
        // Clear iframe source
        element.src = 'about:blank';
      }
      
      console.log(`🧹 Cleared ${key} from memory (was out of view for 10s)`);
      this.logMemoryUsage(`After clearing ${key}`);
    } catch (error) {
      console.warn(`Failed to clear ${key} from memory:`, error);
    }
  }

  /**
   * Restore an element if it was cleared
   */
  private restoreElement(
    element: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement,
    originalSrc: string
  ): void {
    try {
      const currentSrc = this.getElementSrc(element);
      
      // Only restore if currently showing placeholder or blank
      if (
        !currentSrc || 
        currentSrc.includes('data:image/svg+xml') || 
        currentSrc === 'about:blank' ||
        currentSrc === ''
      ) {
        if (element instanceof HTMLImageElement) {
          element.src = originalSrc;
        } else if (element instanceof HTMLVideoElement) {
          element.src = originalSrc;
          element.load();
        } else if (element instanceof HTMLIFrameElement) {
          element.src = originalSrc;
        }
        console.log(`🔄 Restored element with src: ${originalSrc.substring(0, 50)}...`);
      }
    } catch (error) {
      console.warn('Failed to restore element:', error);
    }
  }

  /**
   * Get source URL from different element types
   */
  private getElementSrc(element: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement): string {
    if (element instanceof HTMLImageElement) {
      return element.src;
    } else if (element instanceof HTMLVideoElement) {
      return element.src || element.currentSrc;
    } else if (element instanceof HTMLIFrameElement) {
      return element.src;
    }
    return '';
  }

  /**
   * Generate a unique key for an element
   */
  private generateKey(element: HTMLElement): string {
    // Try to create a stable key based on element attributes
    const src = this.getElementSrc(element as any);
    const className = element.className;
    const id = element.id;
    
    // Create hash-like key from element properties
    const keyString = `${src}-${className}-${id}-${element.tagName}`;
    return btoa(keyString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Clear all viewport tracking (useful for cleanup)
   */
  clearAllTracking(): void {
    this.viewportTrackers.forEach((tracker, key) => {
      this.stopTrackingImage(key);
    });
    console.log('🧹 Cleared all image tracking');
  }

  /**
   * Get tracking stats for debugging
   */
  getTrackingStats(): { 
    totalTracked: number; 
    inViewport: number; 
    outOfViewport: number; 
    pendingCleanup: number; 
  } {
    let inViewport = 0;
    let outOfViewport = 0;
    let pendingCleanup = 0;

    this.viewportTrackers.forEach((tracker) => {
      if (tracker.isInViewport) {
        inViewport++;
      } else {
        outOfViewport++;
        if (tracker.timeoutId) {
          pendingCleanup++;
        }
      }
    });

    return {
      totalTracked: this.viewportTrackers.size,
      inViewport,
      outOfViewport,
      pendingCleanup,
    };
  }

  /**
   * Clears home page media elements to reduce memory usage
   */
  clearHomePageMedia(): void {
    if (this.isMemoryCleared) return;

    console.log('🧹 Clearing home page media to reduce memory usage...');

    // Clear showreel iframe
    this.clearShowreel();
    
    // Clear project grid videos and images
    this.clearProjectGridMedia();
    
    // Hide background sprites
    this.hideBackgroundSprites();

    this.isMemoryCleared = true;
    console.log('✅ Home page media cleared from memory');
  }

  /**
   * Restores home page media elements
   */
  restoreHomePageMedia(): void {
    if (!this.isMemoryCleared) return;

    console.log('🔄 Restoring home page media...');

    this.clearedElements.forEach((mediaElement, key) => {
      const { element, originalSrc, originalContent, type } = mediaElement;
      
      try {
        switch (type) {
          case 'iframe':
            if (originalSrc && element instanceof HTMLIFrameElement) {
              element.src = originalSrc;
            }
            break;
          case 'video':
            if (originalSrc && element instanceof HTMLVideoElement) {
              element.src = originalSrc;
              element.load(); // Reload the video
            }
            break;
          case 'image':
            if (originalSrc && element instanceof HTMLImageElement) {
              element.src = originalSrc;
            }
            break;
          case 'background':
            if (element.style) {
              element.style.display = '';
              element.style.visibility = '';
            }
            break;
        }
      } catch (error) {
        console.warn(`Failed to restore element ${key}:`, error);
      }
    });

    this.clearedElements.clear();
    this.isMemoryCleared = false;
    console.log('✅ Home page media restored');
  }

  private clearShowreel(): void {
    const showreelIframes = document.querySelectorAll('iframe[src*="vimeo.com"]:not([data-exclude-memory-management="true"])');
    showreelIframes.forEach((iframe, index) => {
      const element = iframe as HTMLIFrameElement;
      const key = `showreel-${index}`;
      
      this.clearedElements.set(key, {
        element,
        originalSrc: element.src,
        type: 'iframe'
      });
      
      // Clear the src to stop video playback and free memory
      element.src = 'about:blank';
    });
  }

  private clearProjectGridMedia(): void {
    // Clear project grid videos
    const projectVideos = document.querySelectorAll('.project-item-inner video');
    projectVideos.forEach((video, index) => {
      const element = video as HTMLVideoElement;
      const key = `project-video-${index}`;
      
      // Pause the video
      element.pause();
      
      this.clearedElements.set(key, {
        element,
        originalSrc: element.src,
        type: 'video'
      });
      
      // Clear sources to free memory
      element.removeAttribute('src');
      element.load();
    });

    // Clear project grid images
    const projectImages = document.querySelectorAll('.project-item-inner img');
    projectImages.forEach((img, index) => {
      const element = img as HTMLImageElement;
      const key = `project-image-${index}`;
      
      this.clearedElements.set(key, {
        element,
        originalSrc: element.src,
        type: 'image'
      });
      
      // Use a small placeholder to reduce memory usage
      element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+';
    });

    // Clear any Next.js Image components by targeting their underlying img elements
    const nextImages = document.querySelectorAll('img[src*="media.jakobbackhouse.com"], img[src*="res.cloudinary.com"]');
    nextImages.forEach((img, index) => {
      const element = img as HTMLImageElement;
      const key = `next-image-${index}`;
      
      if (!this.clearedElements.has(key)) {
        this.clearedElements.set(key, {
          element,
          originalSrc: element.src,
          type: 'image'
        });
        
        element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+';
      }
    });
  }

  private hideBackgroundSprites(): void {
    const backgroundElements = document.querySelectorAll('.background-sprite, [class*="background"], [class*="sprite"]');
    backgroundElements.forEach((element, index) => {
      const key = `background-${index}`;
      
      this.clearedElements.set(key, {
        element: element as HTMLElement,
        type: 'background'
      });
      
      // Hide background elements to reduce rendering load
      (element as HTMLElement).style.display = 'none';
    });
  }

  /**
   * Force garbage collection if available (mainly for development)
   */
  forceGarbageCollection(): void {
    if ('gc' in window && typeof window.gc === 'function') {
      try {
        window.gc();
        console.log('🗑️ Forced garbage collection');
      } catch (error) {
        console.warn('Failed to force garbage collection:', error);
      }
    }
  }

  /**
   * Get memory usage info if available
   */
  getMemoryInfo(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Log memory usage for debugging
   */
  logMemoryUsage(context: string): void {
    const memoryInfo = this.getMemoryInfo();
    if (memoryInfo) {
      console.log(`📊 Memory usage (${context}):`, {
        used: `${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    }
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();

// Utility functions for easy access
export const clearHomePageMedia = () => memoryManager.clearHomePageMedia();
export const restoreHomePageMedia = () => memoryManager.restoreHomePageMedia();
export const logMemoryUsage = (context: string) => memoryManager.logMemoryUsage(context);

// New utility functions for automatic memory management
export const trackImageForMemoryManagement = (
  element: HTMLImageElement | HTMLVideoElement | HTMLIFrameElement,
  key?: string
) => memoryManager.trackImageForMemoryManagement(element, key);

export const stopTrackingImage = (key: string) => memoryManager.stopTrackingImage(key);
export const clearAllTracking = () => memoryManager.clearAllTracking();
export const getTrackingStats = () => memoryManager.getTrackingStats(); 