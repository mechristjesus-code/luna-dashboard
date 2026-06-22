"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge } from "@/components/luna/PulseIndicator";
import { SEED_STRATEGIES, TradingStrategy } from "@/lib/luna/data";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BOTS = ["ALPHA-1", "BETA-X", "GAMMA-3", "DELTA-9"];

const btnStyle = (color: string, bg: string, border: string): React.CSSProperties => ({
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11,
  letterSpacing: "0.1em", fontWeight: 700, padding: "7px 18px",
  borderRadius: 5, cursor: "pointer", border: `1px solid ${border}`,
  background: bg, color, transition: "opacity 0.15s",
});

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(0,245,255,0.04)",
  border: "1px solid rgba(0,245,255,0.18)", borderRadius: 5,
  padding: "7px 10px", color: "rgba(255,255,255,0.85)",
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11,
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em",
  textTransform: "uppercase", marginBottom: 4, display: "block",
};

const monoSm: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.4)",
};

function makePnlCurve(trend = 30) {
  return Array.from({ length: 30 }, (_, i) => ({
    time: `D${i + 1}`,
    pnl: parseFloat((trend * i + (Math.random() - 0.4) * 150).toFixed(2)),
  }));
}

export default function StrategyBuilderPage() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>(SEED_STRATEGIES);
  const [selected, setSelected] = useState<TradingStrategy | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestDone, setBacktestDone] = useState(false);
  const [assignBot, setAssignBot] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "", signalConditions: "", entry: "RSI Oversold",
    allocation: "10", stopLoss: "5", takeProfit: "15", risk: "Moderate",
  });
  const [formError, setFormError] = useState("");
  const [simRunning, setSimRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);

  const handleSelect = (s: TradingStrategy) => {
    setSelected(s);
    setIsBacktesting(false);
    setBacktestDone(false);
    setAssignBot("");
    setAssignSuccess(false);
  };

  const runBacktest = () => {
    setIsBacktesting(true);
    setBacktestDone(false);
    setTimeout(() => { setIsBacktesting(false); setBacktestDone(true); }, 2000);
  };

  const confirmAssign = () => {
    if (assignBot) { setAssignSuccess(true); }
  };

  const field = (key: keyof typeof formData, val: string) =>
    setFormData(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (!formData.name.trim() || !formData.signalConditions.trim()) {
      setFormError("Name and Signal Conditions are required.");
      return;
    }
    setFormError("");
    const newS: TradingStrategy = {
      id: `st${Date.now()}`, name: formData.name,
      signalConditions: formData.signalConditions, status: "draft",
      winRate: 0, maxDrawdown: 0, tradeCount: 0, pnlCurve: [],
    };
    setStrategies(p => [newS, ...p]);
    setFormData({ name: "", signalConditions: "", entry: "RSI Oversold", allocation: "10", stopLoss: "5", takeProfit: "15", risk: "Moderate" });
    setSimDone(false);
  };

  const handleSimulate = () => {
    if (!formData.name.trim() || !formData.signalConditions.trim()) {
      setFormError("Name and Signal Conditions are required to simulate.");
      return;
    }
    setFormError(""); setSimRunning(true); setSimDone(false);
    setTimeout(() => {
      const wr = Math.floor(Math.random() * 30 + 50);
      const md = parseFloat((Math.random() * 15 + 5).toFixed(1));
      const tc = Math.floor(Math.random() * 180 + 20);
      const newS: TradingStrategy = {
        id: `st${Date.now()}`, name: formData.name,
        signalConditions: formData.signalConditions, status: "active",
        winRate: wr, maxDrawdown: md, tradeCount: tc, pnlCurve: makePnlCurve(35),
      };
      setStrategies(p => [newS, ...p]);
      setSimRunning(false); setSimDone(true);
      setSelected(newS);
      setFormData({ name: "", signalConditions: "", entry: "RSI Oversold", allocation: "10", stopLoss: "5", takeProfit: "15", risk: "Moderate" });
    }, 2000);
  };

  return (
    <LunaLayout title="STRATEGY BUILDER" subtitle="V6 Extended · Define, backtest, and deploy trading strategies">
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* LEFT: 60% */}
        <div style={{ flex: "0 0 60%", display: "flex", flexDirection: "column", gap: 16 }}>
          <NeonCard accent="cyan" padding={16}>
            <SectionHeader title="STRATEGIES" subtitle={`${strategies.length} total`} accent="cyan" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {strategies.map(s => (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "9px 12px", borderRadius: 6, cursor: "pointer",
                    background: selected?.id === s.id ? "rgba(0,245,255,0.07)" : "rgba(255,255,255,0.02)",
                    border: selected?.id === s.id ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}>
                      {s.name}
                    </div>
                    <div style={{ ...monoSm, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.signalConditions}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                  {s.winRate > 0 && (
                    <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "#00FF88", minWidth: 40, textAlign: "right" }}>
                      {s.winRate}%
                    </div>
                  )}
                  <div style={{ ...monoSm, minWidth: 36, textAlign: "right" }}>
                    {s.tradeCount > 0 ? `${s.tradeCount}T` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>

          {/* Detail View */}
          {selected && (
            <NeonCard accent="violet" padding={18}>
              <SectionHeader title={selected.name} subtitle={selected.signalConditions} accent="violet" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                <MetricTile label="Win Rate" value={`${selected.winRate}%`} accent="green" />
                <MetricTile label="Max DD" value={`${selected.maxDrawdown}%`} accent="magenta" />
                <MetricTile label="Trades" value={selected.tradeCount} accent="cyan" />
                <div>
                  <NeonCard accent="amber" padding={16}>
                    <div style={labelStyle}>Status</div>
                    <StatusBadge status={selected.status} />
                  </NeonCard>
                </div>
              </div>

              {/* PnL Curve */}
              {selected.pnlCurve.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ ...labelStyle, marginBottom: 8 }}>PNL CURVE</div>
                  <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "8px 4px 4px" }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={selected.pnlCurve} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                        <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 6, fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "#00F5FF" }} />
                        <Line type="monotone" dataKey="pnl" stroke="#00F5FF" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button style={btnStyle("#00F5FF", "rgba(0,245,255,0.1)", "rgba(0,245,255,0.4)")} onClick={runBacktest} disabled={isBacktesting}>
                  {isBacktesting ? "RUNNING..." : "RUN BACKTEST"}
                </button>
                {backtestDone && (
                  <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#00FF88" }}>
                    ✓ Backtest complete — Win: {selected.winRate}% · DD: {selected.maxDrawdown}% · {selected.tradeCount} trades
                  </span>
                )}
              </div>

              {/* Assign to bot */}
              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  value={assignBot}
                  onChange={e => { setAssignBot(e.target.value); setAssignSuccess(false); }}
                  style={{ ...inputStyle, width: "auto", minWidth: 140 }}
                >
                  <option value="">— Select Bot —</option>
                  {BOTS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <button
                  style={btnStyle("#9B5DE5", "rgba(155,93,229,0.12)", "rgba(155,93,229,0.4)")}
                  onClick={confirmAssign}
                  disabled={!assignBot}
                >
                  ASSIGN TO BOT
                </button>
                {assignSuccess && (
                  <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#00FF88" }}>
                    ✓ Strategy assigned to {assignBot}
                  </span>
                )}
              </div>
            </NeonCard>
          )}
        </div>

        {/* RIGHT: 40% — Create Form */}
        <div style={{ flex: "0 0 40%" }}>
          <NeonCard accent="violet" padding={20}>
            <SectionHeader title="NEW STRATEGY" subtitle="Define entry rules & risk parameters" accent="violet" />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Strategy Name *</label>
                <input style={inputStyle} value={formData.name} onChange={e => field("name", e.target.value)} placeholder="e.g. RSI Reversal v3" />
              </div>

              <div>
                <label style={labelStyle}>Signal Conditions *</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 64, resize: "vertical" }}
                  value={formData.signalConditions}
                  onChange={e => field("signalConditions", e.target.value)}
                  placeholder="e.g. RSI < 30 + Volume > 1.5x avg"
                />
              </div>

              <div>
                <label style={labelStyle}>Entry Trigger</label>
                <select style={inputStyle} value={formData.entry} onChange={e => field("entry", e.target.value)}>
                  <option>RSI Oversold</option>
                  <option>MACD Cross</option>
                  <option>Volume Breakout</option>
                  <option>Momentum Surge</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Alloc %</label>
                  <input style={inputStyle} type="number" min={1} max={100} value={formData.allocation} onChange={e => field("allocation", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Stop Loss %</label>
                  <input style={inputStyle} type="number" min={0} value={formData.stopLoss} onChange={e => field("stopLoss", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Take Profit %</label>
                  <input style={inputStyle} type="number" min={0} value={formData.takeProfit} onChange={e => field("takeProfit", e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Risk Level</label>
                <select style={inputStyle} value={formData.risk} onChange={e => field("risk", e.target.value)}>
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>

              {formError && (
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#FF006E", padding: "6px 10px", background: "rgba(255,0,110,0.08)", border: "1px solid rgba(255,0,110,0.25)", borderRadius: 5 }}>
                  ⚠ {formError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button style={btnStyle("#00F5FF", "rgba(0,245,255,0.1)", "rgba(0,245,255,0.4)")} onClick={handleSave}>
                  SAVE STRATEGY
                </button>
                <button style={btnStyle("#9B5DE5", "rgba(155,93,229,0.12)", "rgba(155,93,229,0.4)")} onClick={handleSimulate} disabled={simRunning}>
                  {simRunning ? "SIMULATING..." : "RUN SIMULATION"}
                </button>
              </div>

              {simDone && (
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#00FF88", padding: "7px 10px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 5 }}>
                  ✓ Simulation complete — strategy added as ACTIVE. Click it in the list to view results.
                </div>
              )}
            </div>
          </NeonCard>
        </div>

      </div>
    </LunaLayout>
  );
}
