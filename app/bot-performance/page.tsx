"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge, LiveBadge } from "@/components/luna/PulseIndicator";
import { SEED_BOTS, SEED_STRATEGIES } from "@/lib/luna/data";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Area, AreaChart, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// ── Derived aggregates ────────────────────────────────────────────
const simBots = SEED_BOTS.filter((b) => b.mode === "simulation");
const liveBots = SEED_BOTS.filter((b) => b.mode === "live");
const totalPnl = SEED_BOTS.reduce((s, b) => s + b.totalPnl, 0);
const simPnl  = simBots.reduce((s, b) => s + b.totalPnl, 0);
const livePnl = liveBots.reduce((s, b) => s + b.totalPnl, 0);
const totalTrades = SEED_BOTS.reduce((s, b) => s + b.tradeCount, 0);
const bestStrategy = [...SEED_STRATEGIES].sort((a, b) => b.winRate - a.winRate)[0];

// Build aggregate PnL history by summing all bots at each step
const AGG_STEPS = 24;
const aggPnlHistory = Array.from({ length: AGG_STEPS }, (_, i) => ({
  time: `${i}h`,
  pnl: SEED_BOTS.reduce((sum, bot) => {
    const pt = bot.pnlHistory[i];
    return sum + (pt ? pt.pnl : 0);
  }, 0),
}));

// Win rate by strategy for bar chart
const strategyWinRates = SEED_STRATEGIES.map((s) => ({
  name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
  winRate: s.winRate,
}));

// Per-bot mock win rates 60–75
const BOT_WIN_RATES: Record<string, number> = {
  "b1": 68, "b2": 61, "b3": 74, "b4": 60,
};

const mono = "var(--font-jetbrains-mono, monospace)";
const heading = "var(--font-inter-tight, sans-serif)";

const TT_STYLE = {
  contentStyle: { background: "#0D1526", border: "1px solid rgba(0,245,255,0.22)", borderRadius: 6, fontFamily: mono, fontSize: 11 },
  labelStyle: { color: "#00F5FF" },
  itemStyle: { color: "#fff" },
};

// Trade frequency heatmap-style data (hourly, last 24h)
const TRADE_HOURS = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  ALPHA1: Math.floor(Math.random() * 6),
  BETAX: Math.floor(Math.random() * 4),
  GAMMA3: Math.floor(Math.random() * 8),
  DELTA9: Math.floor(Math.random() * 3),
}));

// Drawdown data per bot
function makeDrawdown() {
  return Array.from({ length: 30 }, (_, i) => {
    const base = -Math.abs(Math.sin(i / 6) * 12 + Math.random() * 6);
    return { day: `D${i + 1}`, dd: parseFloat(base.toFixed(2)) };
  });
}
const DRAWDOWN_DATA: Record<string, {day:string;dd:number}[]> = {
  "b1": makeDrawdown(), "b2": makeDrawdown(), "b3": makeDrawdown(), "b4": makeDrawdown(),
};

// Radar chart — strategy comparison
const RADAR_DATA = [
  { metric: "Win Rate", "RSI Rev": 68, "MACD X": 61, "Vol Break": 74, "Mom Surf": 55 },
  { metric: "Profit Factor", "RSI Rev": 72, "MACD X": 58, "Vol Break": 80, "Mom Surf": 50 },
  { metric: "Consistency", "RSI Rev": 75, "MACD X": 65, "Vol Break": 70, "Mom Surf": 45 },
  { metric: "Low Drawdown", "RSI Rev": 76, "MACD X": 62, "Vol Break": 82, "Mom Surf": 40 },
  { metric: "Trade Volume", "RSI Rev": 55, "MACD X": 60, "Vol Break": 45, "Mom Surf": 80 },
];

function fmt(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export default function BotPerformancePage() {
  const [activeBot, setActiveBot] = useState("b1");

  return (
    <LunaLayout
      title="BOT PERFORMANCE DASHBOARD"
      subtitle="Aggregate metrics · All strategies · V5 Execution Agent"
    >
      {/* ── 1. Top metric row ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile
          label="Aggregate PnL"
          value={fmt(totalPnl)}
          sub="All bots combined"
          accent={totalPnl >= 0 ? "green" : "magenta"}
          icon="◈"
        />
        <MetricTile
          label="Win / Loss Ratio"
          value="2.4"
          sub="Rolling 30-day"
          accent="cyan"
          icon="⚖"
        />
        <MetricTile
          label="Best Strategy"
          value={bestStrategy.winRate + "%"}
          sub={bestStrategy.name}
          accent="violet"
          icon="◆"
        />
        <MetricTile
          label="Total Trades"
          value={totalTrades}
          sub="All bots · all time"
          accent="amber"
          icon="⬡"
        />
        <NeonCard accent="cyan" padding={16}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
            Sim PnL / Live PnL
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
            <div>
              <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 18, color: "#00F5FF", textShadow: "0 0 10px #00F5FF55" }}>{fmt(simPnl)}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(0,245,255,0.5)", marginTop: 2 }}>SIM</div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 18 }}>/</div>
            <div>
              <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 18, color: "#FFB700", textShadow: "0 0 10px #FFB70055" }}>{fmt(livePnl)}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,183,0,0.5)", marginTop: 2 }}>LIVE</div>
            </div>
          </div>
        </NeonCard>
      </div>

      {/* ── 2. Chart row ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <NeonCard accent="cyan" padding={16}>
          <SectionHeader title="AGGREGATE PnL OVER TIME" subtitle="Sum of all bot pnlHistory · 24h" accent="cyan" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={aggPnlHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B5DE5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#9B5DE5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.25)", borderRadius: 6, fontFamily: mono, fontSize: 11 }}
                labelStyle={{ color: "#00F5FF" }}
                itemStyle={{ color: "#fff" }}
              />
              <Area type="monotone" dataKey="pnl" stroke="#00F5FF" strokeWidth={2} fill="url(#pnlGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </NeonCard>

        <NeonCard accent="violet" padding={16}>
          <SectionHeader title="WIN RATE BY STRATEGY" subtitle="Active strategies" accent="violet" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={strategyWinRates} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "#0D1526", border: "1px solid rgba(155,93,229,0.3)", borderRadius: 6, fontFamily: mono, fontSize: 11 }}
                labelStyle={{ color: "#9B5DE5" }}
                itemStyle={{ color: "#fff" }}
                formatter={(v: number) => [`${v}%`, "Win Rate"]}
              />
              <Bar dataKey="winRate" fill="#9B5DE5" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </NeonCard>
      </div>

      {/* ── 2b. Per-bot sparklines ────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {SEED_BOTS.map((bot) => {
          const isActive = activeBot === bot.id;
          const botColor = bot.mode === "live" ? "#FFB700" : "#00F5FF";
          return (
            <NeonCard key={bot.id} accent={bot.mode === "live" ? "amber" : "cyan"} padding={12}
              onClick={() => setActiveBot(bot.id)}
              style={{ cursor: "pointer", border: isActive ? `1px solid ${botColor}66` : undefined, boxShadow: isActive ? `0 0 16px ${botColor}22` : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 13, color: botColor }}>{bot.name}</span>
                <LiveBadge mode={bot.mode} />
              </div>
              <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{bot.coinPair}</div>
              <ResponsiveContainer width="100%" height={60}>
                <AreaChart data={bot.pnlHistory} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${bot.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={botColor} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={botColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="pnl" stroke={botColor} strokeWidth={1.5} fill={`url(#grad-${bot.id})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <div>
                  <div style={{ fontFamily: mono, fontSize: 8, color: "rgba(255,255,255,0.35)" }}>PnL</div>
                  <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 13, color: bot.totalPnl >= 0 ? "#00FF88" : "#FF006E" }}>{fmt(bot.totalPnl)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: mono, fontSize: 8, color: "rgba(255,255,255,0.35)" }}>Win Rate</div>
                  <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 13, color: "#00FF88" }}>{BOT_WIN_RATES[bot.id]}%</div>
                </div>
              </div>
            </NeonCard>
          );
        })}
      </div>

      {/* ── 2c. Drawdown + Strategy Radar ────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {/* Drawdown chart for selected bot */}
        <NeonCard accent="magenta" padding={16}>
          <SectionHeader title="DRAWDOWN ANALYSIS" subtitle={`${SEED_BOTS.find(b=>b.id===activeBot)?.name ?? "Bot"} · Click a sparkline to switch`} accent="magenta" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DRAWDOWN_DATA[activeBot]} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF006E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FF006E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8, fontFamily: mono }} axisLine={false} tickLine={false} interval={9} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}%`} />
              <Tooltip {...TT_STYLE} formatter={(v: number) => [`${v}%`, "Drawdown"]} />
              <Area type="monotone" dataKey="dd" stroke="#FF006E" strokeWidth={2} fill="url(#ddGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </NeonCard>

        {/* Strategy Radar */}
        <NeonCard accent="violet" padding={16}>
          <SectionHeader title="STRATEGY RADAR" subtitle="Multi-dimensional performance comparison" accent="violet" />
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={RADAR_DATA} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 9, fontFamily: mono }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 7 }} axisLine={false} />
              <Radar name="RSI Rev" dataKey="RSI Rev" stroke="#00F5FF" fill="#00F5FF" fillOpacity={0.12} />
              <Radar name="Vol Break" dataKey="Vol Break" stroke="#00FF88" fill="#00FF88" fillOpacity={0.12} />
              <Radar name="MACD X" dataKey="MACD X" stroke="#9B5DE5" fill="#9B5DE5" fillOpacity={0.08} />
              <Tooltip {...TT_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </NeonCard>
      </div>

      {/* ── 2d. Trade frequency bar chart ────────────────────── */}
      <NeonCard accent="cyan" padding={16} style={{ marginBottom: 20 }}>
        <SectionHeader title="TRADE FREQUENCY — LAST 24H" subtitle="Trades executed per hour by bot" accent="cyan" />
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={TRADE_HOURS} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={6} barGap={1}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8, fontFamily: mono }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={24} />
            <Tooltip {...TT_STYLE} />
            <Bar dataKey="ALPHA1" fill="#00F5FF" fillOpacity={0.8} />
            <Bar dataKey="BETAX" fill="#9B5DE5" fillOpacity={0.8} />
            <Bar dataKey="GAMMA3" fill="#00FF88" fillOpacity={0.8} />
            <Bar dataKey="DELTA9" fill="#FFB700" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
          {[["ALPHA-1","#00F5FF"],["BETA-X","#9B5DE5"],["GAMMA-3","#00FF88"],["DELTA-9","#FFB700"]].map(([name, color]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
              <span style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{name}</span>
            </div>
          ))}
        </div>
      </NeonCard>

      {/* ── 3. Per-bot breakdown table ─────────────────────── */}
      <NeonCard accent="cyan" padding={0} style={{ marginBottom: 20 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
          <SectionHeader title="PER-BOT BREAKDOWN" subtitle="Individual performance metrics" accent="cyan" />
        </div>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "140px 100px 70px 90px 70px 110px 90px 70px",
          gap: 8,
          padding: "8px 18px",
          background: "rgba(0,245,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {["Bot Name", "Coin Pair", "Mode", "Status", "Win Rate", "Virt. Balance", "PnL", "Trades"].map((h) => (
            <div key={h} style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {SEED_BOTS.map((bot, idx) => {
          const isEvenCyan = idx % 2 === 0;
          const winRate = BOT_WIN_RATES[bot.id] ?? 65;
          return (
            <div
              key={bot.id}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 100px 70px 90px 70px 110px 90px 70px",
                gap: 8,
                padding: "10px 18px",
                background: isEvenCyan ? "rgba(0,245,255,0.025)" : "rgba(155,93,229,0.025)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                alignItems: "center",
              }}
            >
              <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 13, color: "#fff" }}>{bot.name}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{bot.coinPair}</div>
              <div><LiveBadge mode={bot.mode} /></div>
              <div><StatusBadge status={bot.status} /></div>
              <div style={{ fontFamily: mono, fontSize: 12, color: "#00FF88" }}>{winRate}%</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.65)" }}>${bot.virtualBalance.toLocaleString()}</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: bot.totalPnl >= 0 ? "#00FF88" : "#FF006E" }}>
                {fmt(bot.totalPnl)}
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{bot.tradeCount}</div>
            </div>
          );
        })}
      </NeonCard>

      {/* ── 4. Sim vs Live comparison ─────────────────────── */}
      <NeonCard accent="amber" padding={0}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,183,0,0.15)" }}>
          <SectionHeader title="SIMULATION vs LIVE COMPARISON" subtitle="Aggregate stats by execution mode" accent="amber" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {[
            { label: "SIMULATION", bots: simBots, accent: "#00F5FF", border: "rgba(0,245,255,0.15)" },
            { label: "LIVE", bots: liveBots, accent: "#FFB700", border: "rgba(255,183,0,0.15)" },
          ].map(({ label, bots, accent, border }) => (
            <div key={label} style={{ padding: 20, borderRight: label === "SIMULATION" ? `1px solid ${border}` : undefined }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: accent, letterSpacing: "0.15em", marginBottom: 14, textTransform: "uppercase" }}>
                ◈ {label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { k: "Bot Count", v: bots.length },
                  { k: "Total Balance", v: `$${bots.reduce((s, b) => s + b.virtualBalance, 0).toLocaleString()}` },
                  { k: "Total PnL", v: fmt(bots.reduce((s, b) => s + b.totalPnl, 0)) },
                  { k: "Avg Trades/Bot", v: bots.length ? Math.round(bots.reduce((s, b) => s + b.tradeCount, 0) / bots.length) : 0 },
                ].map(({ k, v }) => (
                  <div key={k}>
                    <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{k}</div>
                    <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 18, color: accent }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </NeonCard>
    </LunaLayout>
  );
}
