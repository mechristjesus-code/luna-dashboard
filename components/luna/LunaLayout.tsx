"use client";

import { Sidebar } from "./Sidebar";

interface LunaLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export function LunaLayout({ children, title, subtitle, headerRight }: LunaLayoutProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050810" }}>
      <Sidebar />
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {title && (
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(0,245,255,0.1)",
            background: "rgba(13,21,38,0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-inter-tight, sans-serif)",
                fontWeight: 700,
                fontSize: 20,
                color: "#00F5FF",
                letterSpacing: "0.06em",
                textShadow: "0 0 12px rgba(0,245,255,0.4)",
                margin: 0,
              }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, marginTop: 2 }}>
                  {subtitle}
                </p>
              )}
            </div>
            {headerRight && <div>{headerRight}</div>}
          </div>
        )}
        <main style={{ flex: 1, padding: "20px 24px", overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
