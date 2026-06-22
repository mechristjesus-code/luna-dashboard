"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LUNA_LAYERS } from "@/lib/luna/data";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  pinned?: boolean;
}

const PINNED_ITEMS: NavItem[] = [
  { href: "/", label: "Command Center", icon: "⌂", pinned: true },
  { href: "/crypto-signals", label: "Crypto Signals", icon: "◉", badge: "LIVE", badgeColor: "#00F5FF", pinned: true },
  { href: "/chat-console", label: "Chat Console", icon: "◈", pinned: true },
  { href: "/activity-feed", label: "Activity Feed", icon: "≡", pinned: true },
];

const BOT_ITEMS: NavItem[] = [
  { href: "/bot-engine", label: "Bot Engine", icon: "⚙" },
  { href: "/dca-bot", label: "DCA Bots", icon: "⬇" },
  { href: "/signal-bot", label: "Signal Bots", icon: "📡" },
  { href: "/grid-bot", label: "Grid Bots", icon: "▦" },
  { href: "/arbitrage-bot", label: "Arbitrage Bot", icon: "⚡", badge: "NEW", badgeColor: "#00FF88" },
  { href: "/smarttrade", label: "SmartTrade", icon: "◎" },
  { href: "/bot-performance", label: "Bot Performance", icon: "📈" },
  { href: "/strategy-builder", label: "Strategy Builder", icon: "◧" },
];

const ANALYTICS_ITEMS: NavItem[] = [
  { href: "/economy-dashboard", label: "Economy Dashboard", icon: "⬡" },
  { href: "/portfolio", label: "Portfolio", icon: "◆" },
  { href: "/performance-monitor", label: "Performance Monitor", icon: "📊", badge: "NEW", badgeColor: "#00F5FF" },
  { href: "/signal-risk-monitor", label: "Signal & Risk", icon: "⚠", badge: "NEW", badgeColor: "#FFB703" },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin-terminal", label: "Admin Terminal", icon: "⌥", badge: "TERM", badgeColor: "#FFB700" },
  { href: "/api-docs", label: "API Docs", icon: "📋", badge: "REST", badgeColor: "#9B5DE5" },
  { href: "/webhook", label: "Webhook Signals", icon: "◉", badge: "NEW", badgeColor: "#FF006E" },
  { href: "/downloads", label: "Downloads", icon: "⬇", badge: "ZIP+APK", badgeColor: "#00FF88" },
];

const LAYER_GROUPS = [
  {
    group: "Cognition",
    versions: ["V1", "V2", "V3"],
    href: (v: string) => `/layers/${v.toLowerCase()}`,
    color: "#00F5FF",
  },
  {
    group: "Agent",
    versions: ["V4", "V5", "V6"],
    href: (v: string) => `/layers/${v.toLowerCase()}`,
    color: "#9B5DE5",
  },
  {
    group: "Economy",
    versions: ["V7", "V8", "V9"],
    href: (v: string) => {
      if (v === "V7") return "/v7-monetization";
      if (v === "V8") return "/v8-company-factory";
      if (v === "V9") return "/v9-deployment";
      return `/layers/${v.toLowerCase()}`;
    },
    color: "#00FF88",
  },
  {
    group: "SaaS",
    versions: ["V10", "V11"],
    href: (v: string) => {
      if (v === "V10") return "/v10-saas";
      if (v === "V11") return "/v11-global-stack";
      return `/layers/${v.toLowerCase()}`;
    },
    color: "#FFB700",
  },
  {
    group: "Ecosystem",
    versions: ["V12"],
    href: () => "/v12-ecosystem",
    color: "#FF006E",
  },
];

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "#00FF88",
    processing: "#FFB700",
    idle: "#9B5DE5",
    error: "#FF006E",
  };
  const color = colors[status] ?? "#555";
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 4px ${color}`,
        flexShrink: 0,
      }}
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: "#080f1e",
        borderRight: "1px solid rgba(0,245,255,0.12)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22, color: "#00F5FF", textShadow: "0 0 12px #00F5FF" }}>✦</span>
          <div>
            <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 16, color: "#00F5FF", letterSpacing: "0.12em", textShadow: "0 0 8px rgba(0,245,255,0.5)" }}>
              LUNA
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(0,245,255,0.5)", letterSpacing: "0.2em" }}>
              AI COMMAND CENTER
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Navigation */}
      <div style={{ padding: "10px 8px 6px" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(0,245,255,0.4)", letterSpacing: "0.18em", padding: "0 8px 6px", textTransform: "uppercase" }}>
          Operations
        </div>
        {PINNED_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 6,
                marginBottom: 1,
                background: isActive(item.href) ? "rgba(0,245,255,0.08)" : "transparent",
                border: isActive(item.href) ? "1px solid rgba(0,245,255,0.2)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 13, color: isActive(item.href) ? "#00F5FF" : "rgba(255,255,255,0.5)", width: 16, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 12, fontWeight: 500, color: isActive(item.href) ? "#00F5FF" : "rgba(255,255,255,0.72)", flex: 1 }}>
                {item.label}
              </span>
              {item.badge && (
                <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 8, color: item.badgeColor ?? "#00F5FF", border: `1px solid ${item.badgeColor ?? "#00F5FF"}`, borderRadius: 3, padding: "1px 4px", letterSpacing: "0.1em" }}>
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Bots section */}
      <div style={{ padding: "4px 8px 0" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(155,93,229,0.6)", letterSpacing: "0.18em", padding: "6px 8px 4px", textTransform: "uppercase", borderTop: "1px solid rgba(155,93,229,0.1)", marginTop: 2 }}>
          Bot Suite
        </div>
        {BOT_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 5, marginBottom: 1, background: isActive(item.href) ? "rgba(155,93,229,0.08)" : "transparent", border: isActive(item.href) ? "1px solid rgba(155,93,229,0.2)" : "1px solid transparent", cursor: "pointer" }}>
              <span style={{ fontSize: 11, color: isActive(item.href) ? "#9B5DE5" : "rgba(255,255,255,0.4)", width: 16, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 11, fontWeight: 500, color: isActive(item.href) ? "#9B5DE5" : "rgba(255,255,255,0.65)", flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 8, color: item.badgeColor ?? "#9B5DE5", border: `1px solid ${item.badgeColor ?? "#9B5DE5"}`, borderRadius: 3, padding: "1px 4px" }}>{item.badge}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics section */}
      <div style={{ padding: "4px 8px 0" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(0,255,136,0.6)", letterSpacing: "0.18em", padding: "6px 8px 4px", textTransform: "uppercase", borderTop: "1px solid rgba(0,255,136,0.08)", marginTop: 2 }}>
          Analytics
        </div>
        {ANALYTICS_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 5, marginBottom: 1, background: isActive(item.href) ? "rgba(0,255,136,0.07)" : "transparent", border: isActive(item.href) ? "1px solid rgba(0,255,136,0.2)" : "1px solid transparent", cursor: "pointer" }}>
              <span style={{ fontSize: 11, color: isActive(item.href) ? "#00FF88" : "rgba(255,255,255,0.4)", width: 16, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 11, fontWeight: 500, color: isActive(item.href) ? "#00FF88" : "rgba(255,255,255,0.65)", flex: 1 }}>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Admin / API section */}
      <div style={{ padding: "4px 8px 6px" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,183,0,0.6)", letterSpacing: "0.18em", padding: "6px 8px 4px", textTransform: "uppercase", borderTop: "1px solid rgba(255,183,0,0.1)", marginTop: 2 }}>
          Admin / API
        </div>
        {ADMIN_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 5, marginBottom: 1, background: isActive(item.href) ? "rgba(255,183,0,0.07)" : "transparent", border: isActive(item.href) ? "1px solid rgba(255,183,0,0.2)" : "1px solid transparent", cursor: "pointer" }}>
              <span style={{ fontSize: 11, color: isActive(item.href) ? "#FFB700" : "rgba(255,255,255,0.4)", width: 16, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 11, fontWeight: 500, color: isActive(item.href) ? "#FFB700" : "rgba(255,255,255,0.65)", flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 8, color: item.badgeColor ?? "#FFB700", border: `1px solid ${item.badgeColor ?? "#FFB700"}`, borderRadius: 3, padding: "1px 4px" }}>{item.badge}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* LUNA Layers */}
      <div style={{ padding: "4px 8px", flex: 1 }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(0,245,255,0.4)", letterSpacing: "0.18em", padding: "8px 8px 6px", textTransform: "uppercase", borderTop: "1px solid rgba(0,245,255,0.08)", marginTop: 4 }}>
          LUNA Layers
        </div>
        {LAYER_GROUPS.map((group) => (
          <div key={group.group} style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: group.color, letterSpacing: "0.12em", padding: "4px 10px 3px", opacity: 0.7, textTransform: "uppercase" }}>
              {group.group}
            </div>
            {group.versions.map((v) => {
              const layer = LUNA_LAYERS.find((l) => l.version === v);
              const href = group.href(v);
              const active = isActive(href);
              return (
                <Link key={v} href={href} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 5,
                      marginBottom: 1,
                      background: active ? `rgba(${hexToRgb(group.color)},0.07)` : "transparent",
                      border: active ? `1px solid rgba(${hexToRgb(group.color)},0.2)` : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {layer && <StatusDot status={layer.status} />}
                    <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: active ? group.color : "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>{v}</span>
                    <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 11, color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {layer?.name ?? v}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(0,245,255,0.1)", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(0,245,255,0.4)", letterSpacing: "0.12em", marginBottom: 5 }}>SYSTEM STATUS · V2.0</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 6px #00FF88", display: "inline-block" }} />
          <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#00FF88" }}>ALL SYSTEMS NOMINAL</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 8, color: "rgba(0,245,255,0.5)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 3, padding: "1px 5px" }}>ARB ⚡</span>
          <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 8, color: "rgba(0,255,136,0.5)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 3, padding: "1px 5px" }}>AI CHAT</span>
          <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 8, color: "rgba(255,0,110,0.5)", border: "1px solid rgba(255,0,110,0.15)", borderRadius: 3, padding: "1px 5px" }}>WEBHOOK</span>
        </div>
      </div>
    </aside>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
