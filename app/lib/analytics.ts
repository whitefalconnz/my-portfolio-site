/**
 * Sends an event to Google Analytics. Does nothing when analytics isn't running,
 * which is the case locally and until NEXT_PUBLIC_GA_ID is set.
 */
export function trackEvent(name: string, params?: Record<string, string>) {
  (window as any).gtag?.("event", name, params);
}

/**
 * Records a project being opened as a page view, so each project gets its own
 * row in GA's "Pages and screens" report without any setup there. Projects open
 * in a modal with no URL of their own, so `?project=` exists only in the report.
 */
export function trackProjectView(id: string, title: string) {
  trackEvent("page_view", {
    page_title: `${title} (project)`,
    page_location: `${window.location.origin}/?project=${encodeURIComponent(id)}`,
  });
}
