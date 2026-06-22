"use client";

import { useParams } from "next/navigation";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, SectionHeader, MetricTile } from "@/components/luna/NeonCard";
import { StatusBadge } from "@/components/luna/PulseIndicator";
import { LUNA_LAYERS } from "@/lib/luna/data";

export default function LayerPage() {
  const params = useParams();
  const version = (params?.version as string ?? "").toUpperCase();
  const layer = LUNA_LAYERS.find((l) => l.version === version);

  const groupColors: Record<string, string> = {
    Cognition: "#00F5FF",
    Agent: "#9B5DE5",
    Economy: "#00FF88",
    SaaS: "#FFB700",
    Ecosystem: "#FF006E",
  };

  const color = groupColors[layer?.group ?? ""] ?? "#00F5FF";

  const mockMetrics = [
    { label: "Operations/min", value: Math.floor(Math.random() * 200 + 50).toString() },
    { label: "Latency (ms)", value: (Math.random() * 40 + 8).toFixed(1) },
    { label: "Queue depth", value: Math.floor(Math.random() * 30).toString() },
    { label: "Error rate", value: "0.0%" },
  ];

  return (
    <LunaLayout
      title={`${version} — ${layer?.name ?? "Layer"}`}
      subtitle={`${layer?.group ?? "LUNA"} Layer · ${layer?.description ?? ""}`}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {mockMetrics.map((m) => (
          <MetricTile key={m.label} label={m.label} value={m.value} accent="cyan" />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <NeonCard accent="cyan">
          <SectionHeader title="LAYER STATUS" accent="cyan" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Version</span>
              <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 14, color }}>
                {version}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Group</span>
              <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color }}>{layer?.group}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Status</span>
              <StatusBadge status={layer?.status ?? "idle"} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Icon</span>
              <span style={{ fontSize: 20, color }}>{layer?.icon}</span>
            </div>
          </div>
        </NeonCard>

        <NeonCard accent="violet">
          <SectionHeader title="DESCRIPTION" accent="violet" />
          <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0 }}>
            {layer?.description ?? "Layer information not available."}
          </p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(155,93,229,0.08)", borderRadius: 6, border: "1px solid rgba(155,93,229,0.15)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#9B5DE5", marginBottom: 6, letterSpacing: "0.1em" }}>INTEGRATION POINTS</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              ← Input from: {version === "V1" ? "External data feeds" : `${version} previous layer`}<br />
              → Output to: {version === "V12" ? "Ecosystem expansion" : `${version} next layer`}
            </div>
          </div>
        </NeonCard>
      </div>
    </LunaLayout>
  );
}
