"use client";

/**
 * Global error boundary. This replaces the root layout, so it cannot use the
 * design system or any imported component — everything is inline here on
 * purpose. Copy matches the in-app error screen so the tone is consistent.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#03050a",
          backgroundImage:
            "radial-gradient(600px 300px at 50% -10%, rgba(6,214,224,0.10), transparent 70%)",
          color: "#f0f4fa",
          fontFamily: '"Geist", "Inter", system-ui, sans-serif',
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "30rem",
            width: "100%",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1.25rem",
            padding: "2rem 1.5rem",
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          <div
            style={{
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "1rem",
              background: "rgba(244,63,94,0.10)",
              border: "1px solid rgba(244,63,94,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fb7185" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.75rem", letterSpacing: "-0.02em" }}>
            We couldn&rsquo;t analyze this content.
          </h1>
          <p style={{ fontSize: "1rem", color: "#a8b8d0", lineHeight: 1.65, margin: "0 0 1rem" }}>
            PRATIBIMB could not start this screen. Nothing you entered was sent anywhere.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b7c96", lineHeight: 1.6, margin: "0 0 2rem" }}>
            Reload to try again. Your message never left this device.
          </p>

          <button
            onClick={retry}
            style={{
              background: "linear-gradient(135deg, #06d6e0 0%, #9333ea 100%)",
              color: "#03050a",
              border: 0,
              borderRadius: "0.75rem",
              padding: "0.85rem 2rem",
              minHeight: 48,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(6, 214, 224, 0.25)",
            }}
          >
            Reload
          </button>

          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#6b7c96", marginTop: "1.5rem" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}