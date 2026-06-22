"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts";
import { RiskHeatmap } from "@/components/luna/RiskHeatmap";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em",
  textTransform: "uppercase", marginBottom: 4, display: "block",
};

const monoSm: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.4)",
};

export default function SignalRiskMonitorPage() {
  const [selectedAsset, setSelectedAsset] = useState("BTC");

  // Signal health data
  const signalMetrics = [
    { date: "Jun 16", triggered: 12, critical: 2, executed: 10, missed: 2 },
    { date: "Jun 17", triggered: 18, critical: 3, executed: 16, missed: 2 },
    { date: "Jun 18", triggered: 14, critical: 2, executed: 13, missed: 1 },
    { date: "Jun 19", triggered: 22, critical: 4, executed: 20, missed: 2 },
    { date: "Jun 20", triggered: 16, critical: 2, executed: 15, missed: 1 },
    { date: "Jun 21", triggered: 25, critical: 5, executed: 23, missed: 2 },
    { date: "Jun 22", triggered: 28, critical: 6, executed: 26, missed: 2 },
  ];

  // Recent signals
  const recentSignals = [
    { id: 1, pair: "BTC/USDT", indicator: "RSI", value: 28.4, sentiment: "bullish", confidence: 91, source: "Webhook", status: "executed", time: "2 min ago" },
    { id: 2, pair: "ETH/USDT", indicator: "MACD", value: 0.82, sentiment: "bullish", confidence: 74, source: "TradingView", status: "executed", time: "5 min ago" },
    { id: 3, pair: "SOL/USDT", indicator: "Volume Spike", value: 3.4, sentiment: "neutral", confidence: 62, source: "Internal", status: "pending", time: "8 min ago" },
    { id: 4, pair: "BNB/USDT", indicator: "Momentum", value: 72.1, sentiment: "bullish", confidence: 80, source: "Webhook", status: "executed", time: "12 min ago" },
    { id: 5, pair: "BTC/USDT", indicator: "Whale Alert", value: 12400, sentiment: "bullish", confidence: 88, source: "External API", status: "executed", time: "15 min ago" },
  ];

  // Portfolio risk data
  const portfolioAssets = [
    { symbol: "BTC", allocation: 44.2, target: 40, drift: 4.2, volatility: 38.4, riskScore: 62, correlation: 0.85 },
    { symbol: "ETH", allocation: 30.4, target: 30, drift: 0.4, volatility: 44.2, riskScore: 68, correlation: 0.92 },
    { symbol: "SOL", allocation: 15.0, target: 15, drift: 0.0, volatility: 62.8, riskScore: 75, correlation: 0.78 },
    { symbol: "BNB", allocation: 9.1, target: 10, drift: -0.9, volatility: 31.2, riskScore: 54, correlation: 0.88 },
    { symbol: "USDT", allocation: 1.3, target: 5, drift: -3.7, volatility: 0.1, riskScore: 5, correlation: 0.05 },
  ];

  // Risk vs Return scatter
  const riskReturnData = [
    { name: "ARB-BOT-1", risk: 3.2, return: 8.5, size: 200 },
    { name: "ARB-BOT-2", risk: 4.1, return: 7.8, size: 180 },
    { name: "DCA-BOT-1", risk: 5.5, return: 6.2, size: 150 },
    { name: "GRID-BOT-1", risk: 4.8, return: 7.4, size: 160 },
    { name: "SIGNAL-BOT-1", risk: 7.2, return: 4.6, size: 100 },
  ];

  // Signal conversion funnel
  const conversionFunnel = [
    { stage: "Signals Triggered", count: 127, rate: 100 },
    { stage: "Confidence Filter", count: 112, rate: 88 },
    { stage: "Sentiment Filter", count: 98, rate: 77 },
    { stage: "Cooldown Check", count: 94, rate: 74 },
    { stage: "Executed", count: 89, rate: 70 },
  ];

  const getRiskColor = (score: number) => {
    if (score < 30) return "#00FF88";
    if (score < 60) return "#FFB703";
    return "#FF006E";
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "bullish") return "#00FF88";
    if (sentiment === "bearish") return "#FF006E";
    return "#FFB703";
  };

  return (
    <LunaLayout title="SIGNAL & RISK MONITOR" subtitle="V2.0 · Signal health, portfolio risk, and correlation analysis">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Top Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <NeonCard accent="cyan" padding={16}>
            <div style={labelStyle}>Signals Triggered (7d)</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#00F5FF", marginBottom: 4 }}>
              135
            </div>
            <div style={{ ...monoSm }}>↑ 18% vs previous week</div>
          </NeonCard>
          <NeonCard accent="green" padding={16}>
            <div style={labelStyle}>Execution Rate</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#00FF88", marginBottom: 4 }}>
              92.6%
            </div>
            <div style={{ ...monoSm }}>123 of 135 signals</div>
          </NeonCard>
          <NeonCard accent="magenta" padding={16}>
            <div style={labelStyle}>Portfolio Risk</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#FF006E", marginBottom: 4 }}>
              MODERATE
            </div>
            <div style={{ ...monoSm }}>Avg risk score: 52.8</div>
          </NeonCard>
          <NeonCard accent="amber" padding={16}>
            <div style={labelStyle}>Avg Correlation</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#FFB703", marginBottom: 4 }}>
              0.70
            </div>
            <div style={{ ...monoSm }}>Portfolio diversification</div>
          </NeonCard>
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
          {/* Signal Metrics Over Time */}
          <NeonCard accent="cyan" padding={16}>
            <SectionHeader title="SIGNAL FLOW" subtitle="7-day signal trigger and execution trend" accent="cyan" />
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={signalMetrics} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 6 }} />
                <Legend />
                <Line type="monotone" dataKey="triggered" stroke="#00F5FF" strokeWidth={2} name="Triggered" />
                <Line type="monotone" dataKey="executed" stroke="#00FF88" strokeWidth={2} name="Executed" />
                <Line type="monotone" dataKey="missed" stroke="#FF006E" strokeWidth={1.5} name="Missed" />
              </LineChart>
            </ResponsiveContainer>
          </NeonCard>

          {/* Risk vs Return */}
          <NeonCard accent="green" padding={16}>
            <SectionHeader title="RISK-RETURN PROFILE" subtitle="Bot performance scatter plot" accent="green" />
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis dataKey="risk" name="Max Drawdown (%)" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                <YAxis dataKey="return" name="Avg Return (%)" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6 }} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Bots" data={riskReturnData} fill="#00FF88">
                  {riskReturnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#00F5FF" : "#9B5DE5"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </NeonCard>
        </div>

        {/* Signal Conversion Funnel */}
        <NeonCard accent="magenta" padding={16}>
          <SectionHeader title="SIGNAL CONVERSION FUNNEL" subtitle="From trigger to execution" accent="magenta" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {conversionFunnel.map((stage, idx) => (
              <div key={stage.stage}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "#00F5FF" }}>
                    {stage.stage}
                  </span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "#00FF88" }}>
                    {stage.count} ({stage.rate}%)
                  </span>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 4, height: 20, overflow: "hidden" }}>
                  <div
                    style={{
                      background: `linear-gradient(90deg, #FF006E, #9B5DE5)`,
                      height: "100%",
                      width: `${stage.rate}%`,
                      transition: "width 0.3s",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

        {/* Recent Signals Table */}
        <NeonCard accent="cyan" padding={16}>
          <SectionHeader title="RECENT SIGNALS" subtitle="Last 5 signal triggers" accent="cyan" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,245,255,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Pair</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Indicator</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Value</th>
                  <th style={{ textAlign: "center", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Sentiment</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Confidence</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Source</th>
                  <th style={{ textAlign: "center", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSignals.map((signal) => (
                  <tr key={signal.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,245,255,0.02)" }}>
                    <td style={{ padding: "8px 4px", color: "#00F5FF", fontWeight: 600 }}>{signal.pair}</td>
                    <td style={{ padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{signal.indicator}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{signal.value}</td>
                    <td style={{ textAlign: "center", padding: "8px 4px", color: getSentimentColor(signal.sentiment) }}>
                      {signal.sentiment === "bullish" ? "📈" : signal.sentiment === "bearish" ? "📉" : "➡️"}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88" }}>{signal.confidence}%</td>
                    <td style={{ padding: "8px 4px", color: "rgba(255,255,255,0.6)", fontSize: 9 }}>{signal.source}</td>
                    <td style={{ textAlign: "center", padding: "8px 4px", color: signal.status === "executed" ? "#00FF88" : "#FFB703" }}>
                      {signal.status === "executed" ? "✓" : "⏳"}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)", fontSize: 9 }}>{signal.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeonCard>

        {/* Portfolio Risk Assessment */}
        <NeonCard accent="amber" padding={16}>
          <SectionHeader title="PORTFOLIO RISK ASSESSMENT" subtitle="Asset allocation and risk exposure" accent="amber" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,183,3,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Asset</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Allocation</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Target</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Drift</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Volatility</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Risk Score</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Correlation</th>
                </tr>
              </thead>
              <tbody>
                {portfolioAssets.map((asset) => (
                  <tr key={asset.symbol} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,183,3,0.02)" }}>
                    <td style={{ padding: "8px 4px", color: "#FFB703", fontWeight: 600 }}>{asset.symbol}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{asset.allocation.toFixed(1)}%</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{asset.target.toFixed(1)}%</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: asset.drift > 0 ? "#FF006E" : "#00FF88" }}>
                      {asset.drift > 0 ? "+" : ""}{asset.drift.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{asset.volatility.toFixed(1)}%</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: getRiskColor(asset.riskScore), fontWeight: 600 }}>
                      {asset.riskScore}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.6)" }}>{asset.correlation.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeonCard>

        {/* Risk Heatmap */}
        <RiskHeatmap />

      </div>
    </LunaLayout>
  );
}
