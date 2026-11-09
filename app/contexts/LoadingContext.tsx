"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  Suspense,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  transitionState: "entering" | "visible" | "exiting";
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

function LoadingProviderInner({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [transitionState, setTransitionState] = useState<
    "entering" | "visible" | "exiting"
  >("entering");

  // Runs once, on the initial load of the site. This provider lives in the root
  // layout, so it mounts a single time per full page load and survives every
  // client-side navigation -- which means route changes never replay the
  // loading screen.
  //
  // The screen is already on screen from the server's HTML, before any of this
  // code has downloaded, so its ~1050ms (50ms in, visible until 750ms, 300ms
  // exit) is counted from when the page started rather than from when React
  // took over. On a slow phone that used to add the whole script download on
  // top of the wait. It always stays up for at least MIN_AFTER_START_MS more,
  // so the run cycle is seen however late the scripts arrive.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const MIN_AFTER_START_MS = 450;
    const exitAt = Math.max(750 - performance.now(), MIN_AFTER_START_MS);

    timers.push(setTimeout(() => setTransitionState("visible"), 50));
    timers.push(
      setTimeout(() => {
        setTransitionState("exiting");
        timers.push(setTimeout(() => setIsLoading(false), 300));
      }, exitAt)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // Memoised so consumers only re-render when a value actually changes.
  const value = useMemo(
    () => ({ isLoading, setIsLoading, transitionState }),
    [isLoading, transitionState]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

// Simple Suspense fallback without the orange cube
function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ground">
      <div className="text-center">
        <div className="loading-text text-ink">
          Loading
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <LoadingProviderInner>{children}</LoadingProviderInner>
    </Suspense>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
