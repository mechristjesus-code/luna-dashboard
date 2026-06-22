"use client";

import { useState, useEffect } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { PulseIndicator } from "@/components/luna/PulseIndicator";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

// ── Font shortcuts ────────────────────────────────────────────────
const mono = "var(--font-jetbrains-mono, monospace)";
const head = "var(--font-inter-tight, sans-serif)";

// ── Tooltip style ─────────────────────────────────────────────────
const TT_STYLE = {
  contentStyle: { background: "#0D1526", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, fontFamily: mono, fontSize: 11 },
  labelStyle: { color: "#00F5FF" },
  itemStyle: { color: "#fff" },
};

// ── Seed data ─────────────────────────────────────────────────────
const MRR_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function makeMrrSeries() {
  let base = 4200;
  return MRR_MONTHS.map((m) => {
    base = base + Math.floor(Math.random() * 2200 + 600);
    return { month: m, mrr: base, bot: Math.floor(base * 0.18), saas: Math.floor(base * 0.62), fund: Math.floor(base * 0.2) };
  });
}
const MRR_DATA = makeMrrSeries();
const LATEST_MRR = MRR_DATA[MRR_DATA.length - 1];

// PnL over time (90 days)
function makePnlSeries() {
  let pnl = 0;
  return Array.from({ length: 90 }, (_, i) => {
    pnl += Math.random() * 320 - 80;
    return { day: `D${i + 1}`, pnl: Math.round(pnl) };
  });
}
const PNL_DATA = makePnlSeries();

// Subscription revenue by tier (pie)
const TIER_DATA = [
  { name: "Enterprise", value: 9800, color: "#00FF88" },
  { name: "Pro", value: 7200, color: "#9B5DE5" },
  { name: "Free", value: 1100, color: "#00F5FF" },
];

// Top services
const TOP_SERVICES = [
  { name: "CryptoSignal Pro API", company: "CryptoSignal Pro", mrr: 4800, calls: 48200, tier: "Enterprise" },
  { name: "Alpha Fund Core", company: "Alpha Fund Strategies", mrr: 3100, calls: 12400, tier: "Enterprise" },
  { name: "Market Intel Report", company: "Market Intel Suite", mrr: 2200, calls: 9800, tier: "Pro" },
  { name: "Momentum Tracker API", company: "Momentum Tracker", mrr: 1900, calls: 34100, tier: "Pro" },
  { name: "RSI Scanner API", company: "CryptoSignal Pro", mrr: 1400, calls: 61000, tier: "Pro" },
];

// Bot profit contribution (weekly)
const BOT_PROFIT_WEEKS = ["W1","W2","W3","W4","W5","W6","W7","W8"].map((w, i) => ({
  week: w,
  ALPHA1: Math.round(120 + Math.random() * 180),
  BETAX: Math.round(-40 + Math.random() * 150),
  GAMMA3: Math.round(280 + Math.random() * 320),
  DELTA9: Math.round(-20 + Math.random() * 80),
}));

// Revenue breakdown (stacked area)
const REV_BREAKDOWN = MRR_DATA.map((d) => ({
  month: d.month,
  "SaaS API": d.saas,
  "Fund Mgmt": d.fund,
  "Bot Profit": d.bot,
}));

export default function EconomyDashboard() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const liveRevenue = LATEST_MRR.mrr + tick * 23;
  const totalPnl = PNL_DATA[PNL_DATA.length - 1].pnl;

  return (
    <LunaLayout
      title="ECONOMY SIMULATION DASHBOARD"
      subtitle="Aggregate revenue · PnL · Subscription analytics · Bot profit contribution"
      headerRight={<PulseIndicator color="green" label="LIVE SIMULATION" />}
    >
      {/* ── Row 1: Key Metrics ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Simulated MRR" value={`$${liveRevenue.toLocaleString()}`} sub="Monthly recurring revenue" accent="cyan" icon="⬡" />
        <MetricTile label="Cumulative PnL" value={`${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toLocaleString()}`} sub="90-day all sources" accent={totalPnl >= 0 ? "green" : "magenta"} icon="◈" />
        <MetricTile label="Active Companies" value="4" sub="3 SaaS · 1 Fund" accent="violet" icon="✦" />
        <MetricTile label="Active Services" value="10" sub="8 APIs · 2 Reports" accent="amber" icon="◆" />
        <MetricTile label="Bot Contribution" value={`$${(LATEST_MRR.bot + tick * 4).toLocaleString()}`} sub="Virtual profit this month" accent="green" icon="⚙" />
      </div>

      {/* ── Row 2: MRR over time + Revenue Breakdown ─────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        {/* MRR growth */}
        <NeonCard accent="cyan" padding={16}>
          <SectionHeader title="MRR GROWTH" subtitle="12-month simulated trajectory" accent="cyan" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MRR_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00F5FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip {...TT_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "MRR"]} />
              <Area type="monotone" dataKey="mrr" stroke="#00F5FF" strokeWidth={2} fill="url(#mrrGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </NeonCard>

        {/* Stacked revenue breakdown */}
        <NeonCard accent="violet" padding={16}>
          <SectionHeader title="REVENUE BREAKDOWN" subtitle="SaaS API · Fund Mgmt · Bot Profit" accent="violet" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REV_BREAKDOWN} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="saasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B5DE5" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#9B5DE5" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB700" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFB700" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip {...TT_STYLE} formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]} />
              <Legend wrapperStyle={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.5)" }} />
              <Area type="monotone" dataKey="SaaS API" stackId="1" stroke="#9B5DE5" strokeWidth={1.5} fill="url(#saasGrad)" dot={false} />
              <Area type="monotone" dataKey="Fund Mgmt" stackId="1" stroke="#00FF88" strokeWidth={1.5} fill="url(#fundGrad)" dot={false} />
              <Area type="monotone" dataKey="Bot Profit" stackId="1" stroke="#FFB700" strokeWidth={1.5} fill="url(#botGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </NeonCard>
      </div>

      {/* ── Row 3: PnL 90-day + Subscription Pie ──────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 18 }}>
        {/* 90-day PnL */}
        <NeonCard accent="green" padding={16}>
          <SectionHeader title="CUMULATIVE PnL — 90 DAYS" subtitle="All revenue sources combined" accent="green" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PNL_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="pnlLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00FF88" />
                  <stop offset="100%" stopColor="#00F5FF" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8, fontFamily: mono }} axisLine={false} tickLine={false} interval={14} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip {...TT_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "PnL"]} />
              <Line type="monotone" dataKey="pnl" stroke="url(#pnlLine)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </NeonCard>

        {/* Subscription pie */}
        <NeonCard accent="violet" padding={16}>
          <SectionHeader title="MRR BY TIER" subtitle="Subscription revenue split" accent="violet" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={TIER_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                {TIER_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip {...TT_STYLE} formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
            {TIER_DATA.map((t) => (
              <div key={t.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, display: "inline-block", boxShadow: `0 0 4px ${t.color}` }} />
                  <span style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{t.name}</span>
                </div>
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: t.color }}>${t.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      {/* ── Row 4: Bot Profit Contribution + Top Services ─────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        {/* Bot weekly profit stacked bar */}
        <NeonCard accent="amber" padding={16}>
          <SectionHeader title="BOT PROFIT CONTRIBUTION" subtitle="Weekly virtual PnL by bot" accent="amber" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BOT_PROFIT_WEEKS} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: mono }} axisLine={false} tickLine={false} width={40} />
              <Tooltip {...TT_STYLE} formatter={(v: number, name: string) => [`$${v}`, name]} />
              <Legend wrapperStyle={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.45)" }} />
              <Bar dataKey="ALPHA1" stackId="a" fill="#00F5FF" fillOpacity={0.75} />
              <Bar dataKey="BETAX" stackId="a" fill="#9B5DE5" fillOpacity={0.75} />
              <Bar dataKey="GAMMA3" stackId="a" fill="#00FF88" fillOpacity={0.75} />
              <Bar dataKey="DELTA9" stackId="a" fill="#FFB700" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </NeonCard>

        {/* Top performing services */}
        <NeonCard accent="cyan" padding={0}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
            <SectionHeader title="TOP PERFORMING SERVICES" subtitle="By MRR contribution" accent="cyan" />
          </div>
          {TOP_SERVICES.map((svc, i) => {
            const maxMrr = TOP_SERVICES[0].mrr;
            const pct = (svc.mrr / maxMrr) * 100;
            const tierColor = svc.tier === "Enterprise" ? "#00FF88" : svc.tier === "Pro" ? "#9B5DE5" : "#00F5FF";
            return (
              <div key={svc.name} style={{ padding: "12px 18px", borderBottom: i < TOP_SERVICES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                  <div>
                    <div style={{ fontFamily: head, fontWeight: 600, fontSize: 12, color: "#fff", marginBottom: 2 }}>{svc.name}</div>
                    <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{svc.company} · {svc.calls.toLocaleString()} calls</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: head, fontWeight: 700, fontSize: 14, color: "#00FF88" }}>${svc.mrr.toLocaleString()}</div>
                    <div style={{ fontFamily: mono, fontSize: 8, color: tierColor, border: `1px solid ${tierColor}33`, borderRadius: 3, padding: "1px 4px", marginTop: 2 }}>{svc.tier}</div>
                  </div>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, #00F5FF, #00FF88)`, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </NeonCard>
      </div>

      {/* ── Row 5: Economy Health Summary ───────────────────────── */}
      <EconomyHealthBar liveRevenue={liveRevenue} />
    </LunaLayout>
  );
}

function EconomyHealthBar({ liveRevenue }: { liveRevenue: number }) {
  const metrics = [
    { label: "Revenue Velocity", value: "+18.4%", color: "#00FF88", desc: "Month-over-month growth" },
    { label: "Service Uptime", value: "99.8%", color: "#00F5FF", desc: "Across all 10 services" },
    { label: "Avg Response Time", value: "142ms", color: "#9B5DE5", desc: "API gateway P95" },
    { label: "Churn Rate", value: "2.3%", color: "#FFB700", desc: "Monthly subscriber churn" },
    { label: "NRR", value: "124%", color: "#00FF88", desc: "Net revenue retention" },
  ];
  return (
    <NeonCard accent="cyan" padding={20}>
      <SectionHeader title="ECONOMY HEALTH SUMMARY" subtitle={`Live MRR: $${liveRevenue.toLocaleString()} · V7–V12 pipeline active`} accent="cyan" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ textAlign: "center", padding: 12, background: "rgba(0,0,0,0.25)", borderRadius: 6, border: `1px solid ${m.color}22` }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
            <div style={{ fontFamily: head, fontWeight: 700, fontSize: 22, color: m.color, textShadow: `0 0 10px ${m.color}55` }}>{m.value}</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </NeonCard>
  );
}
