"use client";

import { useState, useEffect } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { PulseIndicator, StatusBadge } from "@/components/luna/PulseIndicator";
import { ActivityFeed } from "@/components/luna/ActivityFeed";
import {
  LUNA_LAYERS,
  SEED_ACTIVITY,
  SEED_BOTS,
  SEED_SIGNALS,
  ActivityLogEntry,
  generateNewSignal,
  formatTime,
} from "@/lib/luna/data";

export default function CommandCenter() {
  const [activity, setActivity] = useState<ActivityLogEntry[]>(SEED_ACTIVITY);
  const [tick, setTick] = useState(0);
  const [systemHealth, setSystemHealth] = useState(94);
  const [activeSignals, setActiveSignals] = useState(SEED_SIGNALS.filter((s) => s.triggered).length);
  const [simulatedRevenue] = useState(127_840);

  // Live feed simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      const sig = generateNewSignal();
      if (sig.triggered) {
        const newEntry: ActivityLogEntry = {
          id: `a${Date.now()}`,
          eventType: "SIGNAL",
          layer: "V2",
          message: `${sig.indicator} alert on ${sig.coinPair} — value: ${sig.value} (threshold: ${sig.threshold})`,
          severity: sig.severity === "critical" ? "critical" : "warn",
          timestamp: new Date(),
        };
        setActivity((prev) => [...prev.slice(-49), newEntry]);
        setActiveSignals((n) => Math.min(n + 1, 12));
      }
      setSystemHealth((h) => Math.max(88, Math.min(99, h + (Math.random() - 0.5) * 2)));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeBots = SEED_BOTS.filter((b) => b.status === "running").length;
  const liveBots = SEED_BOTS.filter((b) => b.mode === "live").length;
  const totalPnl = SEED_BOTS.reduce((s, b) => s + b.totalPnl, 0);

  return (
    <LunaLayout
      title="LUNA COMMAND CENTER"
      subtitle="V1–V12 Architecture · AI Operations Dashboard"
      headerRight={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PulseIndicator color="green" label="ALL SYSTEMS NOMINAL" />
          <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {new Date().toUTCString().slice(0, 25)}
          </span>
        </div>
      }
    >
      {/* ── Metric Overview ─────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="System Health" value={`${systemHealth.toFixed(0)}%`} sub="All 12 layers monitored" accent="green" icon="◎" />
        <MetricTile label="Active Bots" value={activeBots} sub={`${liveBots} live / ${activeBots - liveBots} sim`} accent="cyan" icon="⚙" />
        <MetricTile label="Active Signals" value={activeSignals} sub="Last 60 min triggers" accent="magenta" icon="◉" />
        <MetricTile label="Simulated Revenue" value={`$${(simulatedRevenue + tick * 12).toLocaleString()}`} sub="Monthly recurring" accent="violet" icon="⬡" />
        <MetricTile label="Total PnL" value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toLocaleString()}`} sub="All bots combined" accent={totalPnl >= 0 ? "green" : "magenta"} icon="📈" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginBottom: 20 }}>
        {/* ── V1–V12 Layer Grid ───────────────────────────────── */}
        <div>
          <SectionHeader title="LUNA ARCHITECTURE LAYERS" subtitle="V1–V12 real-time status" accent="cyan" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {LUNA_LAYERS.map((layer) => {
              const groupColors: Record<string, string> = {
                Cognition: "#00F5FF",
                Agent: "#9B5DE5",
                Economy: "#00FF88",
                SaaS: "#FFB700",
                Ecosystem: "#FF006E",
              };
              const color = groupColors[layer.group] ?? "#00F5FF";
              return (
                <NeonCard key={layer.id} accent={layer.group === "Cognition" ? "cyan" : layer.group === "Agent" ? "violet" : layer.group === "Economy" ? "green" : layer.group === "SaaS" ? "amber" : "magenta"} padding={12} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontWeight: 700, fontSize: 13, color, textShadow: `0 0 8px ${color}55` }}>
                      {layer.version}
                    </span>
                    <StatusBadge status={layer.status} />
                  </div>
                  <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>
                    {layer.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>
                    {layer.description}
                  </div>
                  <div style={{ marginTop: 8, fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: color, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {layer.group}
                  </div>
                </NeonCard>
              );
            })}
          </div>
        </div>

        {/* ── Activity Feed ───────────────────────────────────── */}
        <div>
          <SectionHeader title="ACTIVITY FEED" subtitle="Live event stream" accent="cyan" />
          <NeonCard padding={0} style={{ overflow: "hidden" }}>
            <ActivityFeed entries={activity} maxHeight={420} showHeader={false} />
          </NeonCard>
        </div>
      </div>

      {/* ── Bot Status Overview ──────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="ACTIVE BOTS" subtitle="Real-time execution status" accent="violet"
          right={
            <a href="/bot-engine" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#9B5DE5", textDecoration: "none", border: "1px solid rgba(155,93,229,0.3)", borderRadius: 4, padding: "3px 10px" }}>
              MANAGE →
            </a>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {SEED_BOTS.map((bot) => (
            <NeonCard key={bot.id} accent={bot.mode === "live" ? "amber" : "violet"} padding={14}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 13, color: bot.mode === "live" ? "#FFB700" : "#9B5DE5" }}>{bot.name}</span>
                <div style={{ display: "flex", gap: 5 }}>
                  <StatusBadge status={bot.status} />
                  {bot.mode === "live" && <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#FFB700", border: "1px solid #FFB70044", borderRadius: 3, padding: "1px 5px" }}>LIVE</span>}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{bot.coinPair} · {bot.strategy}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Balance</div>
                  <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 14, fontWeight: 600, color: "#00F5FF" }}>${bot.virtualBalance.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>PnL</div>
                  <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 14, fontWeight: 600, color: bot.totalPnl >= 0 ? "#00FF88" : "#FF006E" }}>
                    {bot.totalPnl >= 0 ? "+" : ""}${bot.totalPnl.toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                {bot.tradeCount} trades executed
              </div>
            </NeonCard>
          ))}
        </div>
      </div>

      {/* ── Crypto Signal Summary ────────────────────────────── */}
      <div>
        <SectionHeader title="LATEST CRYPTO SIGNALS" subtitle="Triggered alerts — last 12h" accent="magenta"
          right={
            <a href="/crypto-signals" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#FF006E", textDecoration: "none", border: "1px solid rgba(255,0,110,0.3)", borderRadius: 4, padding: "3px 10px" }}>
              MONITOR →
            </a>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {SEED_SIGNALS.filter((s) => s.triggered).slice(0, 4).map((sig) => (
            <NeonCard key={sig.id} accent={sig.severity === "critical" ? "magenta" : sig.severity === "warn" ? "amber" : "cyan"} padding={12}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 13, color: "#fff" }}>{sig.coinPair}</span>
                <span style={{
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  fontSize: 9,
                  padding: "2px 6px",
                  borderRadius: 3,
                  background: sig.severity === "critical" ? "rgba(255,0,110,0.15)" : sig.severity === "warn" ? "rgba(255,183,0,0.15)" : "rgba(0,245,255,0.1)",
                  color: sig.severity === "critical" ? "#FF006E" : sig.severity === "warn" ? "#FFB700" : "#00F5FF",
                  border: `1px solid ${sig.severity === "critical" ? "#FF006E44" : sig.severity === "warn" ? "#FFB70044" : "#00F5FF33"}`,
                }}>
                  {sig.severity.toUpperCase()}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#9B5DE5", marginBottom: 4 }}>{sig.indicator}</div>
              <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 18, fontWeight: 700, color: "#fff" }}>{sig.value}</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                threshold: {sig.threshold} · {formatTime(sig.timestamp)}
              </div>
            </NeonCard>
          ))}
        </div>
      </div>
    </LunaLayout>
  );
}
