"use client";
import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";

interface EcoNode { id: string; label: string; kind: "company" | "service"; type?: string; x: number; y: number; parentId?: string; }
interface EcoEvent { id: string; ts: string; msg: string; }

const TYPE_COLORS: Record<string, string> = { SaaS: "#00F5FF", Fund: "#9B5DE5", Intelligence: "#00FF88" };

const INIT_NODES: EcoNode[] = [
  // Companies
  { id: "c1", label: "CryptoSignal Pro", kind: "company", type: "SaaS",         x: 150, y: 120 },
  { id: "c2", label: "Alpha Fund",       kind: "company", type: "Fund",         x: 450, y: 100 },
  { id: "c3", label: "Market Intel",     kind: "company", type: "Intelligence", x: 300, y: 280 },
  { id: "c4", label: "Momentum Track",   kind: "company", type: "SaaS",         x: 90,  y: 300 },
  // Services
  { id: "s1",  label: "Core API",       kind: "service", parentId: "c1", x: 60,  y: 60  },
  { id: "s2",  label: "Analytics",      kind: "service", parentId: "c1", x: 220, y: 60  },
  { id: "s3",  label: "RSI Scanner",    kind: "service", parentId: "c1", x: 150, y: 200 },
  { id: "s4",  label: "Fund Core",      kind: "service", parentId: "c2", x: 390, y: 200 },
  { id: "s5",  label: "MACD Monitor",   kind: "service", parentId: "c2", x: 510, y: 190 },
  { id: "s6",  label: "Intel Report",   kind: "service", parentId: "c3", x: 240, y: 350 },
  { id: "s7",  label: "Intel Feed",     kind: "service", parentId: "c3", x: 360, y: 360 },
  { id: "s8",  label: "Tracker Core",   kind: "service", parentId: "c4", x: 30,  y: 200 },
  { id: "s9",  label: "Momentum Anal",  kind: "service", parentId: "c4", x: 120, y: 380 },
  { id: "s10", label: "Volume Alert",   kind: "service", parentId: "c4", x: 200, y: 290 },
];

const PRICING_RECS = [
  { company: "CryptoSignal Pro", advice: "Increase pricing by 15% — demand surge detected", delta: "+15%", color: "#00FF88" },
  { company: "Alpha Fund",       advice: "Enterprise tier underpriced vs. market comps",     delta: "+22%", color: "#FFB700" },
  { company: "Momentum Tracker", advice: "Add usage-based billing for Volume Alert API",    delta: "+$0.002/call", color: "#00F5FF" },
];

const EXPAND_NAMES = ["Volatility Index Feed", "Whale Alert API", "Trend Forecaster", "Portfolio Optimizer", "Sentiment Scanner", "Liquidity Radar", "Cross-Chain Bridge"];
const EXPAND_PARENTS = ["c1", "c2", "c3", "c4"];

function genTs() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function V12Ecosystem() {
  const [nodes, setNodes] = useState<EcoNode[]>(INIT_NODES);
  const [events, setEvents] = useState<EcoEvent[]>([
    { id: "e0", ts: genTs(), msg: "Ecosystem initialized — 4 companies, 10 services active" },
  ]);
  const [hover, setHover] = useState<string | null>(null);

  const edges = nodes.filter((n) => n.kind === "service" && n.parentId).map((n) => {
    const parent = nodes.find((p) => p.id === n.parentId);
    return parent ? { x1: parent.x, y1: parent.y, x2: n.x, y2: n.y } : null;
  }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];

  const companyNodes = nodes.filter((n) => n.kind === "company");
  const serviceCount = nodes.filter((n) => n.kind === "service").length;

  function triggerExpansion() {
    const name = EXPAND_NAMES[Math.floor(Math.random() * EXPAND_NAMES.length)];
    const parentId = EXPAND_PARENTS[Math.floor(Math.random() * EXPAND_PARENTS.length)];
    const parent = nodes.find((n) => n.id === parentId)!;
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 60;
    const nx = Math.max(20, Math.min(560, parent.x + Math.cos(angle) * dist));
    const ny = Math.max(20, Math.min(370, parent.y + Math.sin(angle) * dist));
    const newNode: EcoNode = { id: `s${Date.now()}`, label: name, kind: "service", parentId, x: nx, y: ny };
    setNodes((prev) => [...prev, newNode]);
    const parentName = nodes.find((n) => n.id === parentId)?.label ?? parentId;
    const ev: EcoEvent = { id: `ev${Date.now()}`, ts: genTs(), msg: `New service "${name}" added to ${parentName}` };
    setEvents((prev) => [ev, ...prev].slice(0, 5));
  }

  return (
    <LunaLayout title="ECOSYSTEM ENGINE" subtitle="V12 · Force-directed ecosystem visualization · Autonomous expansion">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Nodes" value={nodes.length} accent="cyan" icon="🔵" />
        <MetricTile label="Companies" value={companyNodes.length} accent="violet" icon="🏢" />
        <MetricTile label="Services" value={serviceCount} accent="green" icon="⚙️" />
        <MetricTile label="Connections" value={edges.length} accent="amber" icon="🔗" />
      </div>

      <NeonCard accent="cyan" style={{ marginBottom: 16 }}>
        <SectionHeader title="ECOSYSTEM GRAPH" subtitle="Live node topology" right={
          <button onClick={triggerExpansion} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.35)", borderRadius: 6, color: "#00F5FF", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, padding: "6px 14px", cursor: "pointer", letterSpacing: "0.08em" }}>
            ⚡ TRIGGER EXPANSION
          </button>
        } />
        <svg width="100%" viewBox="0 0 600 400" style={{ display: "block", background: "rgba(0,0,0,0.25)", borderRadius: 6, border: "1px solid rgba(0,245,255,0.08)" }}>
          <defs>
            <filter id="glow-cyan">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-node">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Edges */}
          {edges.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#00F5FF" strokeOpacity={0.3} strokeWidth={1} filter="url(#glow-cyan)" />
          ))}
          {/* Service nodes */}
          {nodes.filter((n) => n.kind === "service").map((n) => (
            <g key={n.id} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}>
              <circle cx={n.x} cy={n.y} r={12} fill="rgba(0,245,255,0.15)" stroke="#00F5FF" strokeWidth={1} strokeOpacity={0.5} filter="url(#glow-cyan)" />
              {hover === n.id && (
                <foreignObject x={n.x + 14} y={n.y - 14} width={120} height={28}>
                  <div style={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 4, padding: "2px 6px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "#00F5FF", whiteSpace: "nowrap" }}>{n.label}</div>
                </foreignObject>
              )}
            </g>
          ))}
          {/* Company nodes */}
          {companyNodes.map((n) => {
            const color = TYPE_COLORS[n.type ?? "SaaS"];
            const svcCount = nodes.filter((s) => s.kind === "service" && s.parentId === n.id).length;
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={22} fill={`${color}22`} stroke={color} strokeWidth={2} filter="url(#glow-node)" />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fill={color} fontFamily="var(--font-jetbrains-mono,monospace)" fontSize={8} fontWeight="bold">
                  {n.label.split(" ")[0]}
                </text>
                <text x={n.x} y={n.y + 36} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize={8}>
                  {n.label.length > 14 ? n.label.slice(0, 13) + "…" : n.label}
                </text>
                <text x={n.x} y={n.y + 46} textAnchor="middle" fill={color} fontFamily="var(--font-jetbrains-mono,monospace)" fontSize={7}>
                  {svcCount} svc
                </text>
              </g>
            );
          })}
        </svg>
      </NeonCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <NeonCard accent="violet">
          <SectionHeader title="ECOSYSTEM EVENTS" subtitle="Last 5 events" accent="violet" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 8px", background: "rgba(155,93,229,0.05)", borderRadius: 5, border: "1px solid rgba(155,93,229,0.12)" }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "#9B5DE5", minWidth: 60 }}>{ev.ts}</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{ev.msg}</span>
              </div>
            ))}
          </div>
        </NeonCard>

        <NeonCard accent="green">
          <SectionHeader title="DYNAMIC PRICING INTELLIGENCE" subtitle="AI-powered recommendations" accent="green" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PRICING_RECS.map((r, i) => (
              <div key={i} style={{ padding: "10px 12px", background: `${r.color}08`, borderRadius: 6, border: `1px solid ${r.color}25` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-inter-tight,sans-serif)", fontWeight: 700, fontSize: 11, color: "#e0f7ff" }}>{r.company}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: r.color, fontWeight: 700 }}>{r.delta}</span>
                </div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{r.advice}</div>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>
    </LunaLayout>
  );
}
