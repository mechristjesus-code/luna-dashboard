"use client";
import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge } from "@/components/luna/PulseIndicator";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Tier = "Free" | "Pro" | "Enterprise";
type SvcStatus = "active" | "idle";

interface Service {
  id: string; name: string; company: string; status: SvcStatus;
  apiKey: string; usageCount: number; tier: Tier; lastCall: string;
}

const SERVICES: Service[] = [
  { id: "s1",  name: "CryptoSignal Pro Core",   company: "CryptoSignal Pro API",     status: "active", apiKey: "sk-f3a2b1c4e5d6",  usageCount: 4821, tier: "Enterprise", lastCall: "2 min ago" },
  { id: "s2",  name: "CryptoSignal Analytics",  company: "CryptoSignal Pro API",     status: "active", apiKey: "sk-a9b8c7d6e5f4",  usageCount: 3120, tier: "Pro",        lastCall: "5 min ago" },
  { id: "s3",  name: "Alpha Fund Core",         company: "Alpha Fund Strategies",    status: "active", apiKey: "sk-1122334455aa",  usageCount: 980,  tier: "Enterprise", lastCall: "12 min ago" },
  { id: "s4",  name: "Market Intel Report",     company: "Market Intelligence Suite",status: "idle",   apiKey: "sk-bbcc9900ddef",  usageCount: 540,  tier: "Pro",        lastCall: "1 hr ago" },
  { id: "s5",  name: "Market Intel Feed",       company: "Market Intelligence Suite",status: "idle",   apiKey: "sk-deadbeef1234",  usageCount: 220,  tier: "Free",       lastCall: "3 hr ago" },
  { id: "s6",  name: "Momentum Tracker Core",   company: "Momentum Tracker API",     status: "active", apiKey: "sk-cafe0011aabb",  usageCount: 1680, tier: "Pro",        lastCall: "8 min ago" },
  { id: "s7",  name: "Momentum Analytics",      company: "Momentum Tracker API",     status: "active", apiKey: "sk-feed77665544",  usageCount: 875,  tier: "Free",       lastCall: "22 min ago" },
  { id: "s8",  name: "RSI Scanner API",         company: "CryptoSignal Pro API",     status: "active", apiKey: "sk-0987654321ab",  usageCount: 2300, tier: "Pro",        lastCall: "3 min ago" },
  { id: "s9",  name: "MACD Monitor API",        company: "Alpha Fund Strategies",    status: "idle",   apiKey: "sk-abcdef012345",  usageCount: 610,  tier: "Free",       lastCall: "45 min ago" },
  { id: "s10", name: "Volume Alert API",        company: "Momentum Tracker API",     status: "active", apiKey: "sk-99aabb334455",  usageCount: 1450, tier: "Enterprise", lastCall: "1 min ago" },
];

function genUsageHistory(base: number) {
  return Array.from({ length: 7 }, (_, i) => ({ day: `D${i + 1}`, calls: Math.max(0, base + Math.floor((Math.random() - 0.5) * base * 0.5)) }));
}

function TierBadge({ tier }: { tier: Tier }) {
  const cfg = { Free: { color: "#9B5DE5", bg: "rgba(155,93,229,0.1)", border: "rgba(155,93,229,0.3)" }, Pro: { color: "#00F5FF", bg: "rgba(0,245,255,0.1)", border: "rgba(0,245,255,0.3)" }, Enterprise: { color: "#00FF88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.3)" } }[tier];
  return <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 4, padding: "2px 7px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: cfg.color, letterSpacing: "0.1em" }}>{tier.toUpperCase()}</span>;
}

export default function V9Deployment() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const filtered = SERVICES.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.company.toLowerCase().includes(query.toLowerCase())
  );

  const totalCalls = SERVICES.reduce((s, x) => s + x.usageCount, 0);
  const activeCount = SERVICES.filter((s) => s.status === "active").length;

  function toggleReveal(id: string) {
    setRevealed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <LunaLayout title="DEPLOYMENT & GATEWAY" subtitle="V9 · Service deployment, API keys, usage metrics">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Services" value={SERVICES.length} accent="cyan" icon="🔌" />
        <MetricTile label="Active Services" value={activeCount} accent="green" icon="✅" />
        <MetricTile label="Total API Calls" value={totalCalls.toLocaleString()} accent="violet" icon="📡" />
        <MetricTile label="Avg Uptime" value="99.8%" accent="amber" icon="⏱️" />
      </div>

      <SectionHeader title="SERVICE REGISTRY" subtitle="Click row to expand details"
        right={
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services or company..."
            style={{ background: "#0a1020", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, color: "#e0f7ff", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, padding: "6px 12px", outline: "none", width: 240 }}
          />
        }
      />

      <NeonCard accent="cyan" padding={0}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,245,255,0.12)" }}>
              {["Service", "Company", "Tier", "Status", "API Key", "Usage", "Last Call"].map((h) => (
                <th key={h} style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "left", padding: "10px 12px", letterSpacing: "0.1em" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <>
                <tr key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: expanded === s.id ? "rgba(0,245,255,0.04)" : "transparent" }}>
                  <td style={{ padding: "9px 12px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "#c0d8f0" }}>{s.name}</td>
                  <td style={{ padding: "9px 12px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{s.company.split(" ").slice(0, 2).join(" ")}</td>
                  <td style={{ padding: "9px 12px" }}><TierBadge tier={s.tier} /></td>
                  <td style={{ padding: "9px 12px" }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                      {s.apiKey.slice(0, 10)}...
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", minWidth: 100 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                        <div style={{ width: `${Math.min(100, (s.usageCount / 5000) * 100)}%`, height: "100%", background: "#00F5FF", borderRadius: 2, boxShadow: "0 0 4px rgba(0,245,255,0.5)" }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", minWidth: 36 }}>{s.usageCount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: "9px 12px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.lastCall}</td>
                </tr>
                {expanded === s.id && (
                  <tr key={`${s.id}-exp`}>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div style={{ background: "rgba(0,245,255,0.03)", borderBottom: "1px solid rgba(0,245,255,0.1)", padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                        <div>
                          <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>FULL API KEY</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "#00F5FF" }}>
                              {revealed.has(s.id) ? s.apiKey : s.apiKey.slice(0, 10) + "••••••••••"}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); toggleReveal(s.id); }} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 4, color: "#00F5FF", fontSize: 9, padding: "2px 7px", cursor: "pointer", fontFamily: "var(--font-jetbrains-mono,monospace)" }}>
                              {revealed.has(s.id) ? "HIDE" : "REVEAL"}
                            </button>
                          </div>
                          <div style={{ marginTop: 10, fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>RATE LIMIT</div>
                          <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "#FFB700" }}>{s.tier === "Enterprise" ? "10,000/min" : s.tier === "Pro" ? "1,000/min" : "100/min"}</div>
                          <div style={{ marginTop: 8, fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>ENDPOINTS</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {["/v1/data", "/v1/stream", "/v1/history"].map((ep) => (
                              <span key={ep} style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "#9B5DE5" }}>{ep}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ gridColumn: "2 / 4" }}>
                          <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>USAGE OVER 7 DAYS</div>
                          <ResponsiveContainer width="100%" height={90}>
                            <AreaChart data={genUsageHistory(s.usageCount / 7)}>
                              <defs>
                                <linearGradient id={`g-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00F5FF" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="#00F5FF" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="day" tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                              <YAxis hide />
                              <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, fontSize: 10, color: "#00F5FF" }} />
                              <Area type="monotone" dataKey="calls" stroke="#00F5FF" strokeWidth={1.5} fill={`url(#g-${s.id})`} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </NeonCard>
    </LunaLayout>
  );
}
