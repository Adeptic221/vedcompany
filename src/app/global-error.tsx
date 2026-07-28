"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, background: "#0a1628", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <h1 style={{ fontWeight: 300, fontSize: "24px" }}>\u041a\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043e\u0448\u0438\u0431\u043a\u0430</h1>
          <p style={{ marginTop: "16px", opacity: 0.6, fontSize: "14px" }}>{error.message}</p>
          <button type="button" onClick={reset} style={{ marginTop: "32px", padding: "12px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer" }}>
            \u041f\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c
          </button>
        </main>
      </body>
    </html>
  );
}