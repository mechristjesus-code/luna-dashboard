"use client";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MRR_DATA = [
  { month: "Jan", mrr: 12400 }, { month: "Feb", mrr: 13100 }, { month: "Mar", mrr: 13800 },
  { month: "Apr", mrr: 14600 }, { month: "May", mrr: 15200 }, { month: "Jun", mrr: 15900 },
  { month: "Jul", mrr: 16800 }, { month: "Aug", mrr: 17400 }, { month: "Sep", mrr: 18100 },
  { month: "Oct", mrr: 19200 }, { month: "Nov", mrr: 20300 }, { month: "Dec", mrr: 21300 },
];

const SERVICES = ["CryptoSignal Pro", "Market Intel Suite", "Momentum Tracker"];
const TIERS = [
  { name: "Free",       price: 0,   subs: [45, 38, 52],  colors: "#9B5DE5" },
  { name: "Pro",        price: 49,  subs: [32, 28, 24],  colors: "#00F5FF" },
  { name: "Enterprise", price: 199, subs: [12, 8, 8],   colors: "#00FF88" },
];

interface TierRow { service: string; tier: string; price: number; subs: number; mrr: number; pct: number; color: string; }

function buildRows(): TierRow[] {
  const rows: TierRow[] = [];
  TIERS.forEach((t, ti) => {
    SERVICES.forEach((s, si) => {
      rows.push({ service: s, tier: t.name, price: t.price, subs: t.subs[si], mrr: t.price * t.subs[si], pct: 0, color: t.colors });
    });
  });
  const total = rows.reduce((s, r) => s + r.mrr, 0);
  return rows.map((r) => ({ ...r, pct: total ? Math.round((r.mrr / total) * 1000) / 10 : 0 }));
}

const ROWS = buildRows();
const TOTAL_MRR = ROWS.reduce((s, r) => s + r.mrr, 0);
const TOTAL_SUBS = ROWS.reduce((s, r) => s + r.subs, 0);

const BAR_DATA = TIERS.map((t) => ({
  tier: t.name,
  mrr: SERVICES.reduce((s, _, si) => s + t.price * t.subs[si], 0),
}));

export default function V10Saas() {
  return (
    <LunaLayout title="SAAS MARKETPLACE" subtitle="V10 · Subscription tier management · Simulated MRR analytics">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total MRR" value="$21,300" accent="green" icon="💵" />
        <MetricTile label="Total Subscribers" value="247" accent="cyan" icon="👥" />
        <MetricTile label="Active Tiers" value="9" accent="violet" icon="📊" />
        <MetricTile label="Churn Rate" value="2.3%" accent="magenta" icon="📉" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 24 }}>
        <NeonCard accent="cyan">
          <SectionHeader title="MRR GROWTH" subtitle="Jan–Dec simulation" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MRR_DATA}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F5FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00F5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.25)", borderRadius: 6, fontSize: 10, color: "#00F5FF" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "MRR"]} />
              <Line type="monotone" dataKey="mrr" stroke="#00F5FF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </NeonCard>

        <NeonCard accent="violet">
          <SectionHeader title="MRR BY TIER" subtitle="Revenue split" accent="violet" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BAR_DATA} barSize={28}>
              <XAxis dataKey="tier" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(155,93,229,0.25)", borderRadius: 6, fontSize: 10, color: "#9B5DE5" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "MRR"]} />
              <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                {BAR_DATA.map((_, i) => (
                  <rect key={i} fill={["#9B5DE5", "#00F5FF", "#00FF88"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </NeonCard>
      </div>

      <SectionHeader title="SUBSCRIPTION TIERS" subtitle="9 tiers across 3 services" accent="green" />
      <NeonCard accent="green" padding={0}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,255,136,0.12)" }}>
              {["Service", "Tier", "Price/mo", "Subscribers", "MRR", "% of Total"].map((h) => (
                <th key={h} style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "left", padding: "10px 14px", letterSpacing: "0.1em" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid rgba(0,255,136,0.08)", background: "rgba(0,255,136,0.04)" }}>
              <td style={{ padding: "9px 14px", fontFamily: "var(--font-inter-tight,sans-serif)", fontWeight: 700, fontSize: 12, color: "#00FF88" }} colSpan={2}>TOTAL</td>
              <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>—</td>
              <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "#00FF88", fontWeight: 700 }}>{TOTAL_SUBS}</td>
              <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "#00FF88", fontWeight: 700 }}>${TOTAL_MRR.toLocaleString()}</td>
              <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "#00FF88" }}>100%</td>
            </tr>
            {ROWS.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "#c0d8f0" }}>{r.service}</td>
                <td style={{ padding: "9px 14px" }}>
                  <span style={{ background: `${r.color}18`, border: `1px solid ${r.color}44`, borderRadius: 4, padding: "2px 7px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: r.color, letterSpacing: "0.1em" }}>{r.tier.toUpperCase()}</span>
                </td>
                <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{r.price === 0 ? "FREE" : `$${r.price}`}</td>
                <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "#FFB700" }}>{r.subs}</td>
                <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: r.color }}>${r.mrr.toLocaleString()}</td>
                <td style={{ padding: "9px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, maxWidth: 60 }}>
                      <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{r.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </NeonCard>
    </LunaLayout>
  );
}
