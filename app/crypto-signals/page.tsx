"use client";

import { useState, useEffect } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { ActivityFeed } from "@/components/luna/ActivityFeed";
import {
  SEED_SIGNALS,
  generateNewSignal,
  formatTime,
  CryptoSignal,
  ActivityLogEntry,
} from "@/lib/luna/data";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg: "#050810",
  surface: "#0D1526",
  cyan: "#00F5FF",
  violet: "#9B5DE5",
  magenta: "#FF006E",
  green: "#00FF88",
  amber: "#FFB700",
  borderCyan: "rgba(0,245,255,0.18)",
  borderMagenta: "rgba(255,0,110,0.28)",
  fontHead: "var(--font-inter-tight, sans-serif)",
  fontMono: "var(--font-jetbrains-mono, monospace)",
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function severityColor(s: string) {
  if (s === "critical") return C.magenta;
  if (s === "warn") return C.amber;
  return C.cyan;
}

function indicatorColor(ind: string) {
  if (ind === "RSI") return C.cyan;
  if (ind === "MACD") return C.violet;
  if (ind === "volume_spike") return C.amber;
  return C.green;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface AlertRule {
  id: string;
  coinPair: string;
  indicator: string;
  condition: "above" | "below";
  threshold: number;
  active: boolean;
}

// ── Default alert rules ──────────────────────────────────────────────────────
const DEFAULT_RULES: AlertRule[] = [
  { id: "r1", coinPair: "BTC/USDT", indicator: "RSI", condition: "below", threshold: 30, active: true },
  { id: "r2", coinPair: "ETH/USDT", indicator: "volume_spike", condition: "above", threshold: 2.0, active: true },
  { id: "r3", coinPair: "SOL/USDT", indicator: "momentum", condition: "above", threshold: 70, active: false },
];

// ── Page component ────────────────────────────────────────────────────────────
export default function CryptoSignalsPage() {
  const [signals, setSignals] = useState<CryptoSignal[]>(SEED_SIGNALS);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(DEFAULT_RULES);
  const [newSignalIds, setNewSignalIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    coinPair: "",
    indicator: "RSI",
    condition: "below",
    threshold: "",
  });

  // Auto-refresh every 3 s
  useEffect(() => {
    const id = setInterval(() => {
      const sig = generateNewSignal();
      setSignals((prev) => [sig, ...prev].slice(0, 20));
      setNewSignalIds((prev) => new Set([...prev, sig.id]));
      setTimeout(() => {
        setNewSignalIds((prev) => {
          const next = new Set(prev);
          next.delete(sig.id);
          return next;
        });
      }, 1200);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Derived counts
  const totalSignals = signals.length;
  const triggeredCount = signals.filter((s) => s.triggered).length;
  const criticalCount = signals.filter((s) => s.severity === "critical").length;

  // Activity feed entries from triggered signals
  const activityEntries: ActivityLogEntry[] = signals
    .filter((s) => s.triggered)
    .slice(0, 8)
    .map((s) => ({
      id: s.id,
      eventType: s.severity === "critical" ? "ALERT" : "SIGNAL",
      layer: "V2",
      message: `${s.coinPair} ${s.indicator} triggered at ${s.value.toFixed(2)}`,
      timestamp: s.timestamp,
      severity: s.severity,
    }));

  function addRule() {
    if (!formData.coinPair || !formData.threshold) return;
    const rule: AlertRule = {
      id: `r${Date.now()}`,
      coinPair: formData.coinPair.toUpperCase(),
      indicator: formData.indicator,
      condition: formData.condition as "above" | "below",
      threshold: parseFloat(formData.threshold),
      active: true,
    };
    setAlertRules((prev) => [...prev, rule]);
    setFormData({ coinPair: "", indicator: "RSI", condition: "below", threshold: "" });
  }

  function toggleRule(id: string) {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <LunaLayout title="CRYPTO SIGNAL MONITOR" subtitle="Real-time market intelligence · V1-V3 Cognition Layer">
      {/* Metric row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <MetricTile label="Total Signals" value={totalSignals} accent="cyan" />
        <MetricTile label="Triggered Alerts" value={triggeredCount} accent="amber" />
        <MetricTile label="Critical Alerts" value={criticalCount} accent="magenta" />
        <MetricTile label="Active Alert Rules" value={6} accent="violet" />
      </div>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 24 }}>
        <SignalFeed signals={signals} newSignalIds={newSignalIds} />
        <AlertRulesPanel
          rules={alertRules}
          formData={formData}
          setFormData={setFormData}
          onAdd={addRule}
          onToggle={toggleRule}
        />
      </div>

      {/* Activity feed */}
      <NeonCard accent="cyan">
        <SectionHeader title="TRIGGERED SIGNAL LOG" accent="cyan" />
        <ActivityFeed entries={activityEntries} />
      </NeonCard>
    </LunaLayout>
  );
}

// ── Signal Feed ───────────────────────────────────────────────────────────────
function SignalFeed({
  signals,
  newSignalIds,
}: {
  signals: CryptoSignal[];
  newSignalIds: Set<string>;
}) {
  return (
    <NeonCard accent="cyan">
      <SectionHeader title="LIVE SIGNAL FEED" accent="cyan" />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 480, overflowY: "auto" }}>
        {signals.map((sig) => {
          const sc = severityColor(sig.severity);
          const ic = indicatorColor(sig.indicator);
          const isNew = newSignalIds.has(sig.id);
          return (
            <div
              key={sig.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                background: isNew ? "rgba(0,245,255,0.07)" : "rgba(13,21,38,0.6)",
                borderLeft: `3px solid ${sc}`,
                borderRadius: 4,
                transition: "background 0.8s ease",
                fontFamily: C.fontMono,
                fontSize: 12,
              }}
            >
              {/* Pulse dot for triggered */}
              <div style={{ width: 8, flexShrink: 0 }}>
                {sig.triggered && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: sc,
                      boxShadow: `0 0 6px ${sc}`,
                      animation: "pulse 1.2s infinite",
                    }}
                  />
                )}
              </div>

              {/* Coin pair */}
              <span style={{ color: C.cyan, minWidth: 90, fontWeight: 600 }}>{sig.coinPair}</span>

              {/* Indicator badge */}
              <span
                style={{
                  background: `${ic}22`,
                  border: `1px solid ${ic}55`,
                  color: ic,
                  padding: "1px 6px",
                  borderRadius: 3,
                  minWidth: 90,
                  textAlign: "center",
                }}
              >
                {sig.indicator}
              </span>

              {/* Value bar */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(sig.value, 100)}%`,
                      height: "100%",
                      background: sc,
                      borderRadius: 2,
                      boxShadow: `0 0 4px ${sc}`,
                    }}
                  />
                </div>
                <span style={{ color: "#aaa", minWidth: 38, textAlign: "right" }}>
                  {sig.value.toFixed(1)}
                </span>
              </div>

              {/* Threshold */}
              <span style={{ color: "#666", minWidth: 50 }}>/{sig.threshold}</span>

              {/* Severity badge */}
              <span
                style={{
                  background: `${sc}22`,
                  border: `1px solid ${sc}55`,
                  color: sc,
                  padding: "1px 6px",
                  borderRadius: 3,
                  minWidth: 60,
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontSize: 10,
                }}
              >
                {sig.severity}
              </span>

              {/* Timestamp */}
              <span style={{ color: "#555", fontSize: 10, minWidth: 55, textAlign: "right" }}>
                {formatTime(sig.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </NeonCard>
  );
}

// ── Alert Rules Panel ─────────────────────────────────────────────────────────
function AlertRulesPanel({
  rules,
  formData,
  setFormData,
  onAdd,
  onToggle,
}: {
  rules: AlertRule[];
  formData: { coinPair: string; indicator: string; condition: string; threshold: string };
  setFormData: (d: any) => void;
  onAdd: () => void;
  onToggle: (id: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    background: "#0a1020",
    border: `1px solid rgba(0,245,255,0.3)`,
    color: C.cyan,
    fontFamily: C.fontMono,
    fontSize: 12,
    padding: "6px 8px",
    borderRadius: 4,
    outline: "none",
    width: "100%",
  };

  return (
    <NeonCard accent="violet">
      <SectionHeader title="ALERT RULES" accent="violet" />

      {/* Rule list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {rules.map((rule) => (
          <div
            key={rule.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 10px",
              background: "rgba(13,21,38,0.7)",
              border: `1px solid ${rule.active ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 4,
              fontFamily: C.fontMono,
              fontSize: 11,
            }}
          >
            <span style={{ color: C.cyan, flex: 1, fontWeight: 600 }}>{rule.coinPair}</span>
            <span style={{ color: indicatorColor(rule.indicator), minWidth: 80 }}>{rule.indicator}</span>
            <span style={{ color: "#888" }}>{rule.condition}</span>
            <span style={{ color: C.amber, minWidth: 36, textAlign: "right" }}>{rule.threshold}</span>
            {/* Toggle */}
            <button
              onClick={() => onToggle(rule.id)}
              style={{
                marginLeft: 6,
                padding: "2px 8px",
                background: rule.active ? `${C.green}22` : "rgba(255,255,255,0.05)",
                border: `1px solid ${rule.active ? C.green : "#333"}`,
                color: rule.active ? C.green : "#555",
                borderRadius: 3,
                cursor: "pointer",
                fontFamily: C.fontMono,
                fontSize: 10,
              }}
            >
              {rule.active ? "ON" : "OFF"}
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div
        style={{
          borderTop: `1px solid rgba(0,245,255,0.12)`,
          paddingTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ color: C.violet, fontFamily: C.fontMono, fontSize: 11, marginBottom: 2, letterSpacing: 2 }}>
          NEW RULE
        </div>
        <input
          style={inputStyle}
          placeholder="Coin pair (e.g. BTC/USDT)"
          value={formData.coinPair}
          onChange={(e) => setFormData({ ...formData, coinPair: e.target.value })}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <select
            style={inputStyle}
            value={formData.indicator}
            onChange={(e) => setFormData({ ...formData, indicator: e.target.value })}
          >
            <option>RSI</option>
            <option>MACD</option>
            <option>volume_spike</option>
            <option>momentum</option>
          </select>
          <select
            style={inputStyle}
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          >
            <option value="below">below</option>
            <option value="above">above</option>
          </select>
        </div>
        <input
          style={inputStyle}
          type="number"
          placeholder="Threshold"
          value={formData.threshold}
          onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
        />
        <button
          onClick={onAdd}
          style={{
            background: `linear-gradient(90deg, ${C.violet}44, ${C.cyan}22)`,
            border: `1px solid ${C.violet}`,
            color: C.cyan,
            fontFamily: C.fontMono,
            fontSize: 12,
            letterSpacing: 2,
            padding: "8px 0",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          + ADD RULE
        </button>
      </div>
    </NeonCard>
  );
}
