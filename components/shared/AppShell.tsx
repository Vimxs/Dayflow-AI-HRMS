/**
 * AppShell — Top-level layout wrapper.
 * Phase 0: Stub — sidebar nav and auth guards added in Phase 2 (T2.1–T2.2).
 *
 * Architecture doc §3: components/shared/
 */
interface AppShellProps {
  children: React.ReactNode;
  activeItem?: string;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
      }}
    >
      {/* STUB: Sidebar / nav injected in T2.1 */}
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
