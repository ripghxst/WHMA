"use client";

// Replaces the root layout when it fails, so it can't rely on globals.css or next/font.
export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4efe6",
          color: "#211e1e",
          fontFamily: "Georgia, serif",
        }}
      >
        <title>Something went wrong · WHMA Horse Registry</title>
        <div style={{ maxWidth: "32rem", padding: "1.5rem" }}>
          <h1 style={{ fontWeight: 400, color: "#1d1614" }}>
            The registry is unavailable
          </h1>
          <p style={{ color: "#4a3833", lineHeight: 1.6 }}>
            Something went wrong while loading the site. Please try again in a
            moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.25rem",
              border: 0,
              borderRadius: 2,
              background: "#3b2d29",
              color: "#f4efe6",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
