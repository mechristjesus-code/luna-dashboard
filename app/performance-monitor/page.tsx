"use client";

import { useState, useEffect } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em",
  textTransform: "uppercase", marginBottom: 4, display: "block",
};

const monoSm: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.4)",
};

export default function PerformanceMonitorPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedBot, setSelectedBot] = useState("all");

  // Mock performance data
  const performanceData = [
    { date: "Jun 16", totalPnL: 1200, arbPnL: 450, dcaPnL: 350, gridPnL: 400 },
    { date: "Jun 17", totalPnL: 1850, arbPnL: 680, dcaPnL: 520, gridPnL: 650 },
    { date: "Jun 18", totalPnL: 1450, arbPnL: 520, dcaPnL: 380, gridPnL: 550 },
    { date: "Jun 19", totalPnL: 2100, arbPnL: 750, dcaPnL: 620, gridPnL: 730 },
    { date: "Jun 20", totalPnL: 1680, arbPnL: 580, dcaPnL: 450, gridPnL: 650 },
    { date: "Jun 21", totalPnL: 2450, arbPnL: 920, dcaPnL: 780, gridPnL: 750 },
    { date: "Jun 22", totalPnL: 2890, arbPnL: 1100, dcaPnL: 950, gridPnL: 840 },
  ];

  const botPerformance = [
    { name: "ARB-BOT-1", pnl: 4200, winRate: 91, trades: 147, sharpe: 2.3, maxDD: 3.2 },
    { name: "ARB-BOT-2", pnl: 3850, winRate: 88, trades: 88, sharpe: 2.1, maxDD: 4.1 },
    { name: "DCA-BOT-1", pnl: 3100, winRate: 75, trades: 42, sharpe: 1.8, maxDD: 5.5 },
    { name: "GRID-BOT-1", pnl: 2950, winRate: 82, trades: 156, sharpe: 1.9, maxDD: 4.8 },
    { name: "SIGNAL-BOT-1", pnl: 1850, winRate: 68, trades: 28, sharpe: 1.4, maxDD: 7.2 },
  ];

  const arbOpportunities = [
    { exchange1: "Binance", exchange2: "Bybit", pair: "BTC/USDT", spread: 0.28, executed: 147, missed: 23, efficiency: 86 },
    { exchange1: "Binance", exchange2: "OKX", pair: "ETH/USDT", spread: 0.34, executed: 88, missed: 12, efficiency: 88 },
    { exchange1: "Bybit", exchange2: "Kraken", pair: "SOL/USDT", spread: 0.19, executed: 65, missed: 8, efficiency: 89 },
    { exchange1: "Binance", exchange2: "Coinbase", pair: "BNB/USDT", spread: 0.42, executed: 102, missed: 15, efficiency: 87 },
  ];

  const botTypeDistribution = [
    { name: "Arbitrage", value: 2, fill: "#00F5FF" },
    { name: "DCA", value: 1, fill: "#9B5DE5" },
    { name: "Grid", value: 1, fill: "#00FF88" },
    { name: "Signal", value: 1, fill: "#FFB703" },
  ];

  const hourlyPnL = [
    { hour: "00:00", pnl: 120 },
    { hour: "04:00", pnl: 280 },
    { hour: "08:00", pnl: 450 },
    { hour: "12:00", pnl: 620 },
    { hour: "16:00", pnl: 890 },
    { hour: "20:00", pnl: 1100 },
    { hour: "23:59", pnl: 950 },
  ];

  return (
    <LunaLayout title="PERFORMANCE MONITOR" subtitle="V2.0 · Real-time bot performance analytics and arbitrage tracking">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Top Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <NeonCard accent="cyan" padding={16}>
            <div style={labelStyle}>Total PnL (7d)</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#00FF88", marginBottom: 4 }}>
              $14,510
            </div>
            <div style={{ ...monoSm }}>↑ 12.3% vs previous week</div>
          </NeonCard>
          <NeonCard accent="green" padding={16}>
            <div style={labelStyle}>Avg Win Rate</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#00FF88", marginBottom: 4 }}>
              80.8%
            </div>
            <div style={{ ...monoSm }}>Across 5 active bots</div>
          </NeonCard>
          <NeonCard accent="magenta" padding={16}>
            <div style={labelStyle}>Max Drawdown</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#FF006E", marginBottom: 4 }}>
              5.2%
            </div>
            <div style={{ ...monoSm }}>Portfolio risk level</div>
          </NeonCard>
          <NeonCard accent="amber" padding={16}>
            <div style={labelStyle}>Sharpe Ratio</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#FFB703", marginBottom: 4 }}>
              2.1
            </div>
            <div style={{ ...monoSm }}>Risk-adjusted return</div>
          </NeonCard>
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
          {/* PnL Over Time */}
          <NeonCard accent="cyan" padding={16}>
            <SectionHeader title="PNL TREND" subtitle="7-day performance by bot type" accent="cyan" />
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={performanceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 6 }} />
                <Legend />
                <Line type="monotone" dataKey="totalPnL" stroke="#00F5FF" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="arbPnL" stroke="#00FF88" strokeWidth={1.5} name="Arbitrage" />
                <Line type="monotone" dataKey="dcaPnL" stroke="#9B5DE5" strokeWidth={1.5} name="DCA" />
              </LineChart>
            </ResponsiveContainer>
          </NeonCard>

          {/* Bot Type Distribution */}
          <NeonCard accent="green" padding={16}>
            <SectionHeader title="BOT DISTRIBUTION" subtitle="Active bots by type" accent="green" />
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={botTypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {botTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
              {botTypeDistribution.map(bot => (
                <div key={bot.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: bot.fill }}>● {bot.name}</span>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>{bot.value} bot{bot.value > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>

        {/* Bot Performance Table */}
        <NeonCard accent="violet" padding={16}>
          <SectionHeader title="BOT PERFORMANCE LEADERBOARD" subtitle="Ranked by 7-day PnL" accent="violet" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,245,255,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Bot Name</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>PnL (7d)</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Win Rate</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Trades</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Sharpe</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Max DD</th>
                </tr>
              </thead>
              <tbody>
                {botPerformance.map((bot, idx) => (
                  <tr key={bot.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "rgba(0,245,255,0.02)" : "transparent" }}>
                    <td style={{ padding: "8px 4px", color: "#00F5FF" }}>{bot.name}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88" }}>${bot.pnl.toLocaleString()}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88" }}>{bot.winRate}%</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{bot.trades}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#9B5DE5" }}>{bot.sharpe.toFixed(2)}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#FF006E" }}>-{bot.maxDD.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeonCard>

        {/* Arbitrage Opportunities */}
        <NeonCard accent="green" padding={16}>
          <SectionHeader title="ARBITRAGE OPPORTUNITIES" subtitle="Spread capture efficiency by pair" accent="green" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,255,136,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Pair</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Exchange Pair</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Avg Spread</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Executed</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Missed</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {arbOpportunities.map((arb, idx) => (
                  <tr key={arb.pair + idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "rgba(0,255,136,0.02)" : "transparent" }}>
                    <td style={{ padding: "8px 4px", color: "#00FF88", fontWeight: 600 }}>{arb.pair}</td>
                    <td style={{ padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{arb.exchange1} ↔ {arb.exchange2}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#FFB703" }}>{arb.spread.toFixed(2)}%</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88" }}>{arb.executed}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#FF006E" }}>{arb.missed}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88", fontWeight: 600 }}>{arb.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeonCard>

        {/* Hourly PnL */}
        <NeonCard accent="magenta" padding={16}>
          <SectionHeader title="HOURLY PNL DISTRIBUTION" subtitle="When your bots earn the most" accent="magenta" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyPnL} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(255,0,110,0.3)", borderRadius: 6 }} />
              <Bar dataKey="pnl" fill="#FF006E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </NeonCard>

      </div>
    </LunaLayout>
  );
}
