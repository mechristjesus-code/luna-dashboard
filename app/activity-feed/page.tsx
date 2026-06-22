"use client";

import { useState, useEffect } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { ActivityFeed } from "@/components/luna/ActivityFeed";
import { SEED_ACTIVITY, ActivityLogEntry } from "@/lib/luna/data";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Pool of realistic auto-generated events ───────────────────────
const EVENT_POOL: Omit<ActivityLogEntry, "id" | "timestamp">[] = [
  { eventType: "SIGNAL",    layer: "V2", message: "MACD crossover detected on ETH/USDT — bullish divergence",         severity: "info"     },
  { eventType: "BOT",       layer: "V5", message: "Bot GAMMA-3 executed SELL 2.4 SOL @ $142.80 [LIVE]",               severity: "live"     },
  { eventType: "SIGNAL",    layer: "V1", message: "Volume spike on BNB/USDT — 287% above 1h rolling avg",              severity: "warn"     },
  { eventType: "BOT",       layer: "V5", message: "Bot ALPHA-1 trailing stop triggered — position closed [SIM]",       severity: "warn"     },
  { eventType: "MONETIZE",  layer: "V7", message: "New alpha signal scored 92/100 — pipeline queued for SaaS wrap",    severity: "info"     },
  { eventType: "STRATEGY",  layer: "V4", message: "RSI Reversal v2 updated — new threshold calibration applied",       severity: "info"     },
  { eventType: "SIGNAL",    layer: "V2", message: "BTC/USDT RSI dropped to 24.1 — extreme oversold threshold breached", severity: "critical" },
  { eventType: "COMPANY",   layer: "V8", message: "Company entity \"MomentumEdge API\" registered in factory",          severity: "info"     },
  { eventType: "DEPLOY",    layer: "V9", message: "Service deployment confirmed — momentum-scanner-v2 is live",         severity: "info"     },
  { eventType: "ECOSYSTEM", layer: "V12", message: "Ecosystem expanded — new dependency graph node: DeFi Arb Scanner", severity: "warn"     },
];

type FilterType = "ALL" | "INFO" | "WARN" | "CRITICAL" | "LIVE";

const FILTER_COLORS: Record<FilterType, string> = {
  ALL:      "#00F5FF",
  INFO:     "rgba(255,255,255,0.65)",
  WARN:     "#FFB700",
  CRITICAL: "#FF006E",
  LIVE:     "#FFB700",
};

const PIE_COLORS = ["#00F5FF", "#9B5DE5", "#FF006E", "#00FF88", "#FFB700", "#7DF9FF"];

const mono    = "var(--font-jetbrains-mono, monospace)";
const heading = "var(--font-inter-tight, sans-serif)";

export default function ActivityFeedPage() {
  const [filter, setFilter]   = useState<FilterType>("ALL");
  const [events, setEvents]   = useState<ActivityLogEntry[]>(SEED_ACTIVITY);

  // Auto-add a random event every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const template = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
      const newEvent: ActivityLogEntry = {
        ...template,
        id: `auto-${Date.now()}`,
        timestamp: new Date(),
      };
      setEvents((prev) => [newEvent, ...prev]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Filtered events
  const filtered = filter === "ALL"
    ? events
    : events.filter((e) => e.severity === filter.toLowerCase());

  // Top-row metrics
  const total    = events.length;
  const critical = events.filter((e) => e.severity === "critical").length;
  const live     = events.filter((e) => e.severity === "live").length;
  const info     = events.filter((e) => e.severity === "info").length;

  // Pie chart data — breakdown by eventType
  const typeCounts: Record<string, number> = {};
  events.forEach((e) => { typeCounts[e.eventType] = (typeCounts[e.eventType] ?? 0) + 1; });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  return (
    <LunaLayout title="ACTIVITY FEED" subtitle="Full system event log · All layers">

      {/* ── 1. Top metric tiles ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Events"    value={total}    sub="All time · all layers"          accent="cyan"    icon="◈" />
        <MetricTile label="Critical Events" value={critical} sub="Severity = critical"             accent="magenta" icon="⚠" />
        <MetricTile label="Live Events"     value={live}     sub="Severity = live"                 accent="amber"   icon="●" />
        <MetricTile label="Info Events"     value={info}     sub="Severity = info"                 accent="violet"  icon="ℹ" />
      </div>

      {/* ── 2. Filter bar ─────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["ALL", "INFO", "WARN", "CRITICAL", "LIVE"] as FilterType[]).map((f) => {
          const active = filter === f;
          const color  = FILTER_COLORS[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: "0.12em",
                color:      active ? "#050810" : color,
                background: active ? color : "transparent",
                border:     `1px solid ${color}${active ? "" : "66"}`,
                borderRadius: 5,
                padding: "5px 14px",
                cursor: "pointer",
                fontWeight: active ? 700 : 400,
                transition: "all 0.15s",
                textTransform: "uppercase",
              }}
            >
              {f}
              <span style={{ marginLeft: 5, opacity: 0.7, fontSize: 9 }}>
                {f === "ALL" ? events.length
                  : events.filter((e) => e.severity === f.toLowerCase()).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 3 + 5. Feed + Pie in a two-column layout ─────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 12 }}>
        {/* Feed */}
        <NeonCard accent="cyan" padding={0}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
            <SectionHeader
              title="EVENT STREAM"
              subtitle={`${filtered.length} events · filter: ${filter}`}
              accent="cyan"
            />
          </div>
          <ActivityFeed entries={filtered} maxHeight={500} showHeader={false} />
        </NeonCard>

        {/* Pie chart */}
        <NeonCard accent="violet" padding={16}>
          <SectionHeader title="EVENT TYPES" subtitle="Distribution by type" accent="violet" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0D1526", border: "1px solid rgba(155,93,229,0.3)", borderRadius: 6, fontFamily: mono, fontSize: 10 }}
                labelStyle={{ color: "#9B5DE5" }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
            {pieData.map(({ name, value }, i) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                <span style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.55)", flex: 1 }}>{name}</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: PIE_COLORS[i % PIE_COLORS.length] }}>{value}</span>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>
    </LunaLayout>
  );
}
