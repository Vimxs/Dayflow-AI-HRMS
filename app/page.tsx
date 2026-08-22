/**
 * Dayflow HRMS — Root Home Page
 * Phase 0: Placeholder shell — routes will be established in Phase 1 (auth)
 * and Phase 2 (dashboards).
 */
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
      }}
    >
      {/* Branded shell — confirms design tokens + fonts are loading */}
      <div className="glass-card" style={{ padding: "3rem 4rem", textAlign: "center", maxWidth: "480px" }}>
        {/* Logo / wordmark placeholder */}
        <div
          className="gradient-tile"
          style={{
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "24px",
          }}
          aria-hidden="true"
        >
          🌊
        </div>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "var(--color-primary)",
            marginBottom: "0.5rem",
          }}
        >
          Dayflow
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "var(--color-muted)",
            marginBottom: "2rem",
          }}
        >
          Human Resource Management System
        </p>

        <p className="caption" style={{ marginBottom: "0.25rem" }}>
          Phase 0 — Environment ready ✅
        </p>
        <p className="caption">
          Authentication coming in Phase 1.
        </p>

        {/* Status badges — visual proof that token classes work */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <span className="badge-approved">Approved</span>
          <span className="badge-pending">Pending</span>
          <span className="badge-rejected">Rejected</span>
          <span className="badge-halfday">Half-day</span>
        </div>
      </div>
    </main>
  );
}
