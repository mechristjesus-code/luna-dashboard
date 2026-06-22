"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge } from "@/components/luna/PulseIndicator";

interface MonetizationSignal {
  id: string;
  signalType: string;
  description: string;
  classification: "SaaS" | "Fund" | "Intelligence";
  reliabilityScore: number;
  marketDemandScore: number;
  alphaScore: number;
  status: "pending" | "classified" | "packaged";
  createdDate: Date;
}

const SEED_SIGNALS: MonetizationSignal[] = [
  { id: "m1", signalType: "RSI Oversold Pattern", description: "BTC/USDT RSI below 30 with volume confirmation — high-frequency occurrence", classification: "SaaS", reliabilityScore: 82, marketDemandScore: 91, alphaScore: 87, status: "packaged", createdDate: new Date(Date.now() - 86400000) },
  { id: "m2", signalType: "Volume Spike Cluster", description: "Multi-coin coordinated volume spikes — potential market mover detection", classification: "Intelligence", reliabilityScore: 74, marketDemandScore: 88, alphaScore: 79, status: "classified", createdDate: new Date(Date.now() - 172800000) },
  { id: "m3", signalType: "MACD Momentum Strategy", description: "MACD crossover aligned with momentum indicator — consistent win rate", classification: "Fund", reliabilityScore: 68, marketDemandScore: 76, alphaScore: 71, status: "classified", createdDate: new Date(Date.now() - 259200000) },
  { id: "m4", signalType: "Trend Reversal Detector", description: "Price action + RSI divergence pattern — potential 20%+ moves", classification: "SaaS", reliabilityScore: 59, marketDemandScore: 83, alphaScore: 65, status: "pending", createdDate: new Date(Date.now() - 360000) },
];

export default function V7MonetizationPage() {
  const [signals, setSignals] = useState<MonetizationSignal[]>(SEED_SIGNALS);
  const [selected, setSelected] = useState<MonetizationSignal | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const classify = (id: string) => {
    setProcessing(id);
    setTimeout(() => {
      setSignals((prev) => prev.map((s) => s.id === id ? { ...s, status: "classified" } : s));
      setProcessing(null);
    }, 1500);
  };

  const packageSignal = (id: string) => {
    setProcessing(id);
    setTimeout(() => {
      setSignals((prev) => prev.map((s) => s.id === id ? { ...s, status: "packaged" } : s));
      setProcessing(null);
    }, 1800);
  };

  const classColors = { SaaS: "#00F5FF", Fund: "#9B5DE5", Intelligence: "#00FF88" };

  return (
    <LunaLayout title="MONETIZATION ENGINE" subtitle="V7 · Signal-to-Revenue transformation pipeline">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Signals" value={signals.length} accent="cyan" />
        <MetricTile label="Packaged" value={signals.filter(s => s.status === "packaged").length} accent="green" />
        <MetricTile label="Classified" value={signals.filter(s => s.status === "classified").length} accent="violet" />
        <MetricTile label="Pending" value={signals.filter(s => s.status === "pending").length} accent="amber" />
      </div>

      {/* Pipeline visualization */}
      <NeonCard accent="violet" style={{ marginBottom: 20 }}>
        <SectionHeader title="V7 TRANSFORMATION PIPELINE" subtitle="Signal → Classify → Score → Package → Company Blueprint" accent="violet" />
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "8px 0" }}>
          {[
            { label: "CryptoSignal\nRaw Event", color: "#00F5FF", icon: "◈" },
            { label: "Signal\nClassifier", color: "#9B5DE5", icon: "⚙" },
            { label: "Opportunity\nScorer", color: "#9B5DE5", icon: "◎" },
            { label: "Asset\nPackager", color: "#9B5DE5", icon: "⬡" },
            { label: "Company\nBlueprint", color: "#00FF88", icon: "✦" },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", padding: "10px 16px", background: `rgba(${step.color === "#00F5FF" ? "0,245,255" : step.color === "#00FF88" ? "0,255,136" : "155,93,229"},0.08)`, border: `1px solid ${step.color}33`, borderRadius: 8, minWidth: 100 }}>
                <div style={{ fontSize: 20, color: step.color, marginBottom: 4 }}>{step.icon}</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: step.color, whiteSpace: "pre-line", lineHeight: 1.4 }}>{step.label}</div>
              </div>
              {i < 4 && <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${step.color}44, rgba(155,93,229,0.4))`, margin: "0 2px", position: "relative" }}>
                <div style={{ position: "absolute", right: -4, top: -4, color: "#9B5DE5", fontSize: 10 }}>▶</div>
              </div>}
            </div>
          ))}
        </div>
      </NeonCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
        {/* Signal list */}
        <div>
          <SectionHeader title="MONETIZATION SIGNALS" subtitle="Click to classify or package" accent="cyan" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {signals.map((sig) => (
              <NeonCard key={sig.id} accent={sig.status === "packaged" ? "green" : sig.status === "classified" ? "violet" : "amber"} padding={14}
                onClick={() => setSelected(sig)} style={{ cursor: "pointer", border: selected?.id === sig.id ? "1px solid rgba(0,245,255,0.45)" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 14, color: "#fff" }}>{sig.signalType}</span>
                      <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: classColors[sig.classification], border: `1px solid ${classColors[sig.classification]}44`, borderRadius: 3, padding: "1px 6px" }}>{sig.classification.toUpperCase()}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{sig.description}</div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div><span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Reliability </span><span style={{ color: "#00F5FF", fontWeight: 700, fontSize: 12 }}>{sig.reliabilityScore}</span></div>
                      <div><span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Demand </span><span style={{ color: "#9B5DE5", fontWeight: 700, fontSize: 12 }}>{sig.marketDemandScore}</span></div>
                      <div><span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Alpha </span><span style={{ color: "#00FF88", fontWeight: 700, fontSize: 12 }}>{sig.alphaScore}</span></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, marginLeft: 12 }}>
                    <StatusBadge status={sig.status === "pending" ? "idle" : sig.status === "classified" ? "processing" : "active"} />
                    {sig.status === "pending" && (
                      <button onClick={(e) => { e.stopPropagation(); classify(sig.id); }} disabled={processing === sig.id}
                        style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#9B5DE5", border: "1px solid rgba(155,93,229,0.4)", borderRadius: 4, padding: "4px 10px", background: "rgba(155,93,229,0.08)", cursor: "pointer" }}>
                        {processing === sig.id ? "CLASSIFYING..." : "CLASSIFY →"}
                      </button>
                    )}
                    {sig.status === "classified" && (
                      <button onClick={(e) => { e.stopPropagation(); packageSignal(sig.id); }} disabled={processing === sig.id}
                        style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 4, padding: "4px 10px", background: "rgba(0,255,136,0.08)", cursor: "pointer" }}>
                        {processing === sig.id ? "PACKAGING..." : "PACKAGE →"}
                      </button>
                    )}
                    {sig.status === "packaged" && (
                      <a href="/v8-company-factory" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#00FF88", textDecoration: "none", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, padding: "4px 10px", background: "rgba(0,255,136,0.05)" }}>
                        VIEW IN V8 →
                      </a>
                    )}
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div>
          <SectionHeader title="SIGNAL DETAIL" subtitle={selected ? selected.signalType : "Select a signal"} accent="violet" />
          {selected ? (
            <NeonCard accent="violet">
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 16, color: "#9B5DE5", marginBottom: 6 }}>{selected.signalType}</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{selected.description}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Reliability", value: selected.reliabilityScore, color: "#00F5FF" },
                  { label: "Mkt Demand", value: selected.marketDemandScore, color: "#9B5DE5" },
                  { label: "Alpha Score", value: selected.alphaScore, color: "#00FF88" },
                ].map((m) => (
                  <div key={m.label} style={{ textAlign: "center", padding: 10, background: "rgba(0,0,0,0.3)", borderRadius: 6 }}>
                    <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 22, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: 12 }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#9B5DE5", marginBottom: 8, letterSpacing: "0.1em" }}>COMPANY BLUEPRINT PREVIEW</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                  Name: {selected.signalType} API<br />
                  Type: {selected.classification}<br />
                  Pricing: $49/mo · $199/mo · $499/mo<br />
                  Est. MRR: ${(selected.alphaScore * 47 + 1200).toLocaleString()}<br />
                  Services: 1 API endpoint
                </div>
              </div>
            </NeonCard>
          ) : (
            <NeonCard accent="violet" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 32, color: "#9B5DE5", opacity: 0.4, marginBottom: 10 }}>⬡</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Select a signal to view detail and trigger classification pipeline</div>
            </NeonCard>
          )}
        </div>
      </div>
    </LunaLayout>
  );
}
