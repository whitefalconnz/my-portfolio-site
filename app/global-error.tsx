"use client";

// Replaces the whole document when the layout itself fails, so it can't rely
// on the site's stylesheet or font having loaded.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-NZ">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 8,
          padding: 24,
          background: "#000",
          color: "#fff",
          font: "14px/1.45 ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "inherit", fontWeight: 500 }}>
          Something went wrong!
        </h2>
        <p style={{ margin: 0, color: "#8f8f8f" }}>
          A global error occurred. Please refresh the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            alignSelf: "flex-start",
            padding: 0,
            border: 0,
            background: "none",
            color: "#fff",
            font: "inherit",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
