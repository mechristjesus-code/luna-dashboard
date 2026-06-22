"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { PulseIndicator } from "@/components/luna/PulseIndicator";
import { SEED_PORTFOLIO, SEED_EXCHANGES, PortfolioAsset, ExchangeConnection } from "@/lib/luna/data";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const mono = "var(--font-jetbrains-mono, monospace)";
const head = "var(--font-inter-tight, sans-serif)";
const PIE_COLORS = ["#00F5FF", "#9B5DE5", "#00FF88", "#FFB700", "#FF006E"];
const mono_tt = { contentStyle: { background: "#0D1526", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, fontFamily: mono, fontSize: 11 }, labelStyle: { color: "#00F5FF" }, itemStyle: { color: "#fff" } };

export default function PortfolioPage() {
  const [assets, setAssets] = useState<PortfolioAsset[]>(SEED_PORTFOLIO);
  const [exchanges] = useState<ExchangeConnection[]>(SEED_EXCHANGES);
  const [rebalancing, setRebalancing] = useState(false);
  const [rebalanceDone, setRebalanceDone] = useState(false);

  const total = assets.reduce((s, a) => s + a.usdValue, 0);
  const best = [...assets].sort((a, b) => b.change24h - a.change24h)[0];
  const worst = [...assets].sort((a, b) => a.change24h - b.change24h)[0];
  const driftAssets = assets.filter(a => Math.abs(a.drift) > 1);

  function rebalance() {
    setRebalancing(true);
    setTimeout(() => {
      setAssets(p => p.map(a => ({ ...a, allocation: a.targetAllocation, drift: 0 })));
      setRebalancing(false);
      setRebalanceDone(true);
    }, 2000);
  }

  const pieData = assets.map(a => ({ name: a.symbol, value: a.usdValue }));

  return (
    <LunaLayout title="PORTFOLIO" subtitle="Multi-exchange asset overview · Rebalancing · Exchange connections">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Portfolio" value={`$${total.toLocaleString()}`} accent="cyan" />
        <MetricTile label="Assets" value={assets.length} accent="violet" />
        <MetricTile label="Best 24h" value={`${best?.symbol} +${best?.change24h}%`} accent="green" />
        <MetricTile label="Worst 24h" value={`${worst?.symbol} ${worst?.change24h}%`} accent="magenta" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, marginBottom: 18 }}>
        {/* Asset table */}
        <NeonCard accent="cyan" padding={0}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(0,245,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionHeader title="ASSET DISTRIBUTION" accent="cyan" />
            <button onClick={rebalance} disabled={rebalancing}
              style={{ fontFamily: mono, fontSize: 10, color: rebalanceDone ? "#00FF88" : "#FFB700", border: `1px solid ${rebalanceDone ? "rgba(0,255,136,0.3)" : "rgba(255,183,0,0.3)"}`, borderRadius: 4, padding: "5px 14px", background: "transparent", cursor: "pointer" }}>
              {rebalancing ? "REBALANCING..." : rebalanceDone ? "✓ BALANCED" : `REBALANCE (${driftAssets.length} drifted)`}
            </button>
          </div>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 80px 100px 80px 80px 80px 80px", gap: 8, padding: "8px 18px", background: "rgba(0,245,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {["Asset", "Balance", "USD Value", "Alloc", "Target", "Drift", "24h"].map(h => (
              <div key={h} style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {assets.map((a, i) => (
            <div key={a.symbol} style={{ display: "grid", gridTemplateColumns: "80px 80px 100px 80px 80px 80px 80px", gap: 8, padding: "10px 18px", borderBottom: i < assets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined, background: i % 2 === 0 ? "rgba(0,245,255,0.015)" : "transparent", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: head, fontWeight: 700, fontSize: 13, color: PIE_COLORS[i % PIE_COLORS.length] }}>{a.symbol}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{a.name}</div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{a.balance}</div>
              <div style={{ fontFamily: head, fontWeight: 600, fontSize: 13, color: "#00F5FF" }}>${a.usdValue.toLocaleString()}</div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#fff" }}>{a.allocation.toFixed(1)}%</div>
                <div style={{ marginTop: 3, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${a.allocation}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 2, maxWidth: "100%" }} />
                </div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{a.targetAllocation}%</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: Math.abs(a.drift) > 2 ? "#FFB700" : a.drift === 0 ? "#00FF88" : "rgba(255,255,255,0.5)" }}>
                {a.drift > 0 ? "+" : ""}{a.drift.toFixed(1)}%
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: a.change24h >= 0 ? "#00FF88" : "#FF006E" }}>
                {a.change24h >= 0 ? "+" : ""}{a.change24h}%
              </div>
            </div>
          ))}
        </NeonCard>

        {/* Pie */}
        <NeonCard accent="violet" padding={16}>
          <SectionHeader title="ALLOCATION" accent="violet" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />)}
              </Pie>
              <Tooltip {...mono_tt} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
            {assets.map((a, i) => (
              <div key={a.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block" }} />
                  <span style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{a.symbol}</span>
                </div>
                <span style={{ fontFamily: mono, fontSize: 10, color: PIE_COLORS[i % PIE_COLORS.length] }}>{a.allocation.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      {/* Exchange connections */}
      <SectionHeader title="EXCHANGE CONNECTIONS" subtitle="Connected accounts" accent="amber" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {exchanges.map(ex => (
          <NeonCard key={ex.id} accent={ex.status === "connected" ? "green" : "magenta"} padding={14}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: head, fontWeight: 700, fontSize: 14, color: "#fff" }}>{ex.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {ex.status === "connected" && <PulseIndicator color="green" size={6} />}
                <span style={{ fontFamily: mono, fontSize: 9, color: ex.status === "connected" ? "#00FF88" : "#FF006E" }}>{ex.status.toUpperCase()}</span>
              </div>
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{ex.type} · {ex.mode.toUpperCase()}</div>
            <div style={{ fontFamily: head, fontWeight: 700, fontSize: 18, color: "#00F5FF", marginBottom: 4 }}>${ex.totalBalance.toLocaleString()}</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Key: {ex.apiKeyMasked}</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>Synced {Math.round((Date.now() - ex.lastSync.getTime()) / 60000)}m ago</div>
          </NeonCard>
        ))}
      </div>
    </LunaLayout>
  );
}
