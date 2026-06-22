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

// Generate Pine Script based on strategy configuration
function generatePineScript(config: any): string {
  const indicators = [];
  if (config.useRSI) indicators.push("RSI");
  if (config.useMACD) indicators.push("MACD");
  if (config.useBB) indicators.push("Bollinger Bands");

  const indicatorCode = `
// Enabled Indicators: ${indicators.join(", ")}
${config.useRSI ? `rsi_val = ta.rsi(close, ${config.rsiLen || 14})` : ""}
${config.useMACD ? `[macd_line, signal_line, _] = ta.macd(close, ${config.macdFast || 12}, ${config.macdSlow || 26}, ${config.macdSig || 9})` : ""}
${config.useBB ? `[bb_middle, bb_upper, bb_lower] = ta.bb(close, ${config.bbLen || 20}, ${config.bbMult || 2.0})` : ""}
`;

  return `//@version=5
strategy("${config.name}", overlay=true, initial_capital=1000)

// Strategy: ${config.name}
// Signal Conditions: ${config.signalConditions}
// Risk: SL ${config.stopLoss}% | TP ${config.takeProfit}%

${indicatorCode}

// Entry Logic
long_condition = ${config.signalConditions || "true"}
short_condition = not long_condition

if long_condition
    strategy.entry("Long", strategy.long)
if short_condition
    strategy.entry("Short", strategy.short)

// Risk Management
strategy.exit("Exit", stop=strategy.position_avg_price * (1 - ${config.stopLoss || 5}/100), limit=strategy.position_avg_price * (1 + ${config.takeProfit || 15}/100))
`;
}

export default function StrategyBuilderPage() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>(SEED_STRATEGIES);
  const [selected, setSelected] = useState<TradingStrategy | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestDone, setBacktestDone] = useState(false);
  const [assignBot, setAssignBot] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showPineScript, setShowPineScript] = useState(false);
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);
  const [generatedPineScript, setGeneratedPineScript] = useState("");
  
  const [formData, setFormData] = useState({
    name: "", signalConditions: "", entry: "RSI Oversold",
    allocation: "10", stopLoss: "5", takeProfit: "15", risk: "Moderate",
    useRSI: true, useMACD: true, useBB: false,
    rsiLen: "14", rsiOB: "70", rsiOS: "30",
    macdFast: "12", macdSlow: "26", macdSig: "9",
    bbLen: "20", bbMult: "2.0",
    confidence: "80", mode: "signal_only", webhookSecret: "",
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

  const field = (key: keyof typeof formData, val: string | boolean) =>
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
    setFormData({ 
      name: "", signalConditions: "", entry: "RSI Oversold", 
      allocation: "10", stopLoss: "5", takeProfit: "15", risk: "Moderate",
      useRSI: true, useMACD: true, useBB: false,
      rsiLen: "14", rsiOB: "70", rsiOS: "30",
      macdFast: "12", macdSlow: "26", macdSig: "9",
      bbLen: "20", bbMult: "2.0",
      confidence: "80", mode: "signal_only", webhookSecret: "",
    });
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
      setFormData({ 
        name: "", signalConditions: "", entry: "RSI Oversold", 
        allocation: "10", stopLoss: "5", takeProfit: "15", risk: "Moderate",
        useRSI: true, useMACD: true, useBB: false,
        rsiLen: "14", rsiOB: "70", rsiOS: "30",
        macdFast: "12", macdSlow: "26", macdSig: "9",
        bbLen: "20", bbMult: "2.0",
        confidence: "80", mode: "signal_only", webhookSecret: "",
      });
    }, 2000);
  };

  const handleExportPineScript = () => {
    const script = generatePineScript(formData);
    setGeneratedPineScript(script);
    setShowPineScript(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const generatePayloadPreview = () => {
    const payload = {
      secret: formData.webhookSecret || "your_webhook_secret",
      ticker: "BTCUSDT",
      action: formData.signalConditions.toLowerCase().includes("buy") ? "buy" : "sell",
      indicator: `${formData.name}_Signal`,
      value: 65000,
      confidence: parseInt(formData.confidence),
      sentiment: formData.signalConditions.toLowerCase().includes("buy") ? "bullish" : "bearish",
    };
    return JSON.stringify(payload, null, 2);
  };

  return (
    <LunaLayout title="STRATEGY BUILDER" subtitle="V7 Modular · Define, backtest, and deploy trading strategies with Pine Script export">
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

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

              {/* Modular Indicators */}
              <div style={{ background: "rgba(155,93,229,0.08)", border: "1px solid rgba(155,93,229,0.2)", borderRadius: 6, padding: 12 }}>
                <button
                  style={{ ...btnStyle("#9B5DE5", "transparent", "rgba(155,93,229,0.4)"), width: "100%", marginBottom: 10 }}
                  onClick={() => setShowModules(!showModules)}
                >
                  {showModules ? "▼ HIDE MODULES" : "▶ SHOW MODULES"}
                </button>
                {showModules && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input type="checkbox" checked={formData.useRSI} onChange={e => field("useRSI", e.target.checked)} />
                      <span style={labelStyle}>RSI Module</span>
                    </label>
                    {formData.useRSI && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginLeft: 16 }}>
                        <div>
                          <label style={labelStyle}>RSI Length</label>
                          <input style={inputStyle} type="number" value={formData.rsiLen} onChange={e => field("rsiLen", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Overbought</label>
                          <input style={inputStyle} type="number" value={formData.rsiOB} onChange={e => field("rsiOB", e.target.value)} />
                        </div>
                      </div>
                    )}

                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 8 }}>
                      <input type="checkbox" checked={formData.useMACD} onChange={e => field("useMACD", e.target.checked)} />
                      <span style={labelStyle}>MACD Module</span>
                    </label>
                    {formData.useMACD && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginLeft: 16 }}>
                        <div>
                          <label style={labelStyle}>Fast</label>
                          <input style={inputStyle} type="number" value={formData.macdFast} onChange={e => field("macdFast", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Slow</label>
                          <input style={inputStyle} type="number" value={formData.macdSlow} onChange={e => field("macdSlow", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Signal</label>
                          <input style={inputStyle} type="number" value={formData.macdSig} onChange={e => field("macdSig", e.target.value)} />
                        </div>
                      </div>
                    )}

                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 8 }}>
                      <input type="checkbox" checked={formData.useBB} onChange={e => field("useBB", e.target.checked)} />
                      <span style={labelStyle}>Bollinger Bands Module</span>
                    </label>
                    {formData.useBB && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginLeft: 16 }}>
                        <div>
                          <label style={labelStyle}>BB Length</label>
                          <input style={inputStyle} type="number" value={formData.bbLen} onChange={e => field("bbLen", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>BB Multiplier</label>
                          <input style={inputStyle} type="number" step="0.1" value={formData.bbMult} onChange={e => field("bbMult", e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Risk Level</label>
                  <select style={inputStyle} value={formData.risk} onChange={e => field("risk", e.target.value)}>
                    <option>Conservative</option>
                    <option>Moderate</option>
                    <option>Aggressive</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Confidence Score</label>
                  <input style={inputStyle} type="number" min={1} max={100} value={formData.confidence} onChange={e => field("confidence", e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Execution Mode</label>
                <select style={inputStyle} value={formData.mode} onChange={e => field("mode", e.target.value)}>
                  <option value="signal_only">Signal Only (Alerts)</option>
                  <option value="fully_automated">Fully Automated (Webhook)</option>
                </select>
              </div>

              {formData.mode === "fully_automated" && (
                <div>
                  <label style={labelStyle}>Webhook Secret</label>
                  <input style={inputStyle} type="password" value={formData.webhookSecret} onChange={e => field("webhookSecret", e.target.value)} placeholder="Enter your LUNA webhook secret" />
                </div>
              )}

              {formError && (
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#FF006E", padding: "6px 10px", background: "rgba(255,0,110,0.08)", border: "1px solid rgba(255,0,110,0.25)", borderRadius: 5 }}>
                  ⚠ {formError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                <button style={btnStyle("#00F5FF", "rgba(0,245,255,0.1)", "rgba(0,245,255,0.4)")} onClick={handleSave}>
                  SAVE STRATEGY
                </button>
                <button style={btnStyle("#9B5DE5", "rgba(155,93,229,0.12)", "rgba(155,93,229,0.4)")} onClick={handleSimulate} disabled={simRunning}>
                  {simRunning ? "SIMULATING..." : "RUN SIMULATION"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={btnStyle("#00FF88", "rgba(0,255,136,0.1)", "rgba(0,255,136,0.4)")} onClick={handleExportPineScript}>
                  EXPORT TO PINE SCRIPT
                </button>
                <button style={btnStyle("#FFB703", "rgba(255,183,3,0.1)", "rgba(255,183,3,0.4)")} onClick={() => setShowPayloadPreview(!showPayloadPreview)}>
                  {showPayloadPreview ? "HIDE" : "SHOW"} PAYLOAD PREVIEW
                </button>
              </div>

              {showPayloadPreview && (
                <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,183,3,0.2)", borderRadius: 6, padding: 10 }}>
                  <div style={labelStyle}>JSON Webhook Payload</div>
                  <pre style={{ background: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 4, overflow: "auto", fontSize: 9, color: "#00FF88", margin: 0 }}>
                    {generatePayloadPreview()}
                  </pre>
                  <button style={btnStyle("#00FF88", "rgba(0,255,136,0.1)", "rgba(0,255,136,0.4)")} onClick={() => copyToClipboard(generatePayloadPreview())} style={{ marginTop: 8, width: "100%" }}>
                    COPY PAYLOAD
                  </button>
                </div>
              )}

              {simDone && (
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#00FF88", padding: "7px 10px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 5 }}>
                  ✓ Simulation complete — strategy added as ACTIVE. Click it in the list to view results.
                </div>
              )}
            </div>
          </NeonCard>
        </div>

      </div>

      {/* Pine Script Export Modal */}
      {showPineScript && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <NeonCard accent="green" padding={24} style={{ maxWidth: 700, maxHeight: "80vh", overflow: "auto" }}>
            <SectionHeader title="PINE SCRIPT EXPORT" subtitle="Copy and paste into TradingView Pine Editor" accent="green" />
            <pre style={{ background: "rgba(0,0,0,0.5)", padding: 12, borderRadius: 6, overflow: "auto", fontSize: 9, color: "#00FF88", marginBottom: 16, maxHeight: 400 }}>
              {generatedPineScript}
            </pre>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={btnStyle("#00FF88", "rgba(0,255,136,0.1)", "rgba(0,255,136,0.4)")} onClick={() => copyToClipboard(generatedPineScript)} style={{ flex: 1 }}>
                COPY TO CLIPBOARD
              </button>
              <button style={btnStyle("#FF006E", "rgba(255,0,110,0.1)", "rgba(255,0,110,0.4)")} onClick={() => setShowPineScript(false)} style={{ flex: 1 }}>
                CLOSE
              </button>
            </div>
          </NeonCard>
        </div>
      )}
    </LunaLayout>
  );
}
