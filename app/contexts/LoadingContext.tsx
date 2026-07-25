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
  // loading screen. Every timing is half what it was: 50ms in, visible until
  // 750ms, then a 300ms exit, so the whole gate is ~1050ms instead of ~2100ms.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setTransitionState("visible"), 50));
    timers.push(
      setTimeout(() => {
        setTransitionState("exiting");
        timers.push(setTimeout(() => setIsLoading(false), 300));
      }, 750)
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
