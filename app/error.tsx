"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="notice">
      <h2>Something went wrong!</h2>
      <p className="dim">We encountered an unexpected error. Please try again.</p>
      <button type="button" className="word" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
