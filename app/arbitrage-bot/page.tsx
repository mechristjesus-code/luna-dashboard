"use client";
import { useState, useEffect, useCallback } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge, LiveBadge, PulseIndicator } from "@/components/luna/PulseIndicator";
import { SEED_ARBITRAGE_BOTS, ArbitrageBot, ArbitrageOpportunity, formatTime } from "@/lib/luna/data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

const C = {
  bg: "#050810", panel: "#0D1526",
  cyan: "#00F5FF", violet: "#9B5DE5", magenta: "#FF006E", green: "#00FF88", amber: "#FFB700",
  muted: "rgba(255,255,255,0.38)", dim: "rgba(255,255,255,0.1)",
  mono: "var(--font-jetbrains-mono, monospace)", head: "var(--font-inter-tight, sans-serif)",
};

const TT = {
  contentStyle: { background: "#0D1526", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, fontFamily: C.mono, fontSize: 11 },
  labelStyle: { color: C.cyan },
  itemStyle: { color: "#fff" },
};

function Chip({ children, color = C.cyan }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: C.mono, fontSize: 10, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.06em" }}>
      {children}
    </span>
  );
}

function ActionBtn({ label, color, onClick, disabled }: { label: string; color: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ fontFamily: C.mono, fontSize: 10, color: disabled ? "rgba(255,255,255,0.25)" : color, background: disabled ? "rgba(255,255,255,0.04)" : `${color}14`, border: `1px solid ${disabled ? "rgba(255,255,255,0.1)" : `${color}50`}`, borderRadius: 4, padding: "4px 10px", cursor: disabled ? "not-allowed" : "pointer", letterSpacing: "0.1em", transition: "background 0.15s" }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = `${color}28`; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = `${color}14`; }}
    >{label}</button>
  );
}

function OpportunityRow({ opp }: { opp: ArbitrageOpportunity }) {
  const statusColor = opp.status === 'completed' ? C.green : opp.status === 'executing' ? C.amber : opp.status === 'missed' ? C.magenta : C.cyan;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap" }}>
      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, minWidth: 70 }}>{formatTime(opp.detectedAt)}</span>
      <Chip color={C.cyan}>{opp.coinPair}</Chip>
      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
        <span style={{ color: C.violet }}>{opp.buyExchange}</span> → <span style={{ color: C.cyan }}>{opp.sellExchange}</span>
      </span>
      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.amber }}>+{opp.spreadPct.toFixed(3)}%</span>
      <span style={{ fontFamily: C.mono, fontSize: 11, color: opp.estimatedProfit > 0 ? C.green : C.magenta, fontWeight: 700, marginLeft: "auto" }}>
        {opp.estimatedProfit > 0 ? `+$${opp.estimatedProfit.toFixed(2)}` : "MISSED"}
      </span>
      <span style={{ fontFamily: C.mono, fontSize: 9, color: statusColor, border: `1px solid ${statusColor}44`, borderRadius: 3, padding: "1px 5px" }}>
        {opp.status.toUpperCase()}
      </span>
    </div>
  );
}

function BotCard({ bot, selected, onSelect, onAction, onSimulate }: {
  bot: ArbitrageBot; selected: boolean;
  onSelect: () => void;
  onAction: (id: string, a: "start" | "pause" | "stop") => void;
  onSimulate: (id: string) => void;
}) {
  const border = selected ? C.cyan : "rgba(0,245,255,0.15)";
  const execRate = bot.opportunitiesDetected > 0 ? ((bot.opportunitiesExecuted / bot.opportunitiesDetected) * 100).toFixed(1) : "0.0";

  return (
    <div onClick={onSelect} style={{ background: C.panel, border: `1px solid ${border}`, boxShadow: selected ? `0 0 18px rgba(0,245,255,0.18)` : `0 0 10px rgba(0,245,255,0.05)`, borderRadius: 8, padding: 14, cursor: "pointer", marginBottom: 12, transition: "box-shadow 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.head, fontWeight: 700, fontSize: 13, color: C.cyan }}>{bot.name}</span>
        <StatusBadge status={bot.status} />
        <LiveBadge mode={bot.mode} />
        <span style={{ marginLeft: "auto", fontFamily: C.mono, fontSize: 11, color: bot.totalPnl >= 0 ? C.green : C.magenta, fontWeight: 700 }}>
          {bot.totalPnl >= 0 ? "+" : ""}${bot.totalPnl.toFixed(2)}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {bot.exchanges.map(ex => <Chip key={ex} color="rgba(255,255,255,0.5)">{ex}</Chip>)}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {bot.coinPairs.map(p => <Chip key={p} color={C.violet}>{p}</Chip>)}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Min spread: <span style={{ color: C.amber }}>{bot.minSpreadPct}%</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Max invest: <span style={{ color: C.cyan }}>${bot.maxInvestmentPerTrade}</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Fee/side: <span style={{ color: C.magenta }}>{bot.feePerSide}%</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Delay: <span style={{ color: C.amber }}>{bot.executionDelayMs}ms</span></span>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          Exec: <span style={{ color: C.cyan }}>{bot.opportunitiesExecuted}</span>/<span style={{ color: "rgba(255,255,255,0.5)" }}>{bot.opportunitiesDetected}</span> ({execRate}%)
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Win rate: <span style={{ color: C.green }}>{bot.winRate}%</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Avg spread: <span style={{ color: C.amber }}>+{bot.avgSpreadCapture}%</span></span>
      </div>
      <div style={{ height: 55, marginBottom: 9 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bot.pnlHistory} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`arb-${bot.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.green} stopOpacity={0.35} />
                <stop offset="95%" stopColor={C.cyan} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="pnl" stroke={C.green} strokeWidth={1.5} fill={`url(#arb-${bot.id})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
        <ActionBtn label="▶ START" color={C.green} onClick={() => onAction(bot.id, "start")} disabled={bot.status === "running"} />
        <ActionBtn label="⏸ PAUSE" color={C.amber} onClick={() => onAction(bot.id, "pause")} disabled={bot.status !== "running"} />
        <ActionBtn label="■ STOP" color={C.magenta} onClick={() => onAction(bot.id, "stop")} disabled={bot.status === "stopped"} />
        <ActionBtn label="⚡ SIMULATE" color={C.cyan} onClick={() => onSimulate(bot.id)} disabled={bot.status !== "running"} />
      </div>
    </div>
  );
}

export default function ArbitrageBotPage() {
  const [bots, setBots] = useState<ArbitrageBot[]>(SEED_ARBITRAGE_BOTS);
  const [selected, setSelected] = useState<ArbitrageBot | null>(bots[0] ?? null);
  const [liveOpps, setLiveOpps] = useState<ArbitrageOpportunity[]>(bots[0]?.recentOpportunities ?? []);
  const [newOppId, setNewOppId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", exchanges: "Binance,Bybit", coinPairs: "BTC/USDT,ETH/USDT", minSpreadPct: "0.1", maxInvestmentPerTrade: "500", feePerSide: "0.1" });

  // Auto-simulate opportunities for running bots every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setBots(prev => prev.map(bot => {
        if (bot.status !== "running") return bot;
        const spreadPct = parseFloat((Math.random() * 0.5 + 0.08).toFixed(3));
        const basePrice = bot.coinPairs[0]?.startsWith("BTC") ? 67240 : bot.coinPairs[0]?.startsWith("ETH") ? 3241 : 82;
        const buyPrice = basePrice;
        const sellPrice = parseFloat((basePrice * (1 + spreadPct / 100)).toFixed(2));
        const estimatedProfit = parseFloat(((sellPrice - buyPrice) * (bot.maxInvestmentPerTrade / buyPrice) - (bot.feePerSide * 2 / 100 * bot.maxInvestmentPerTrade)).toFixed(2));
        const opp: ArbitrageOpportunity = {
          id: `ao${Date.now()}${bot.id}`,
          coinPair: bot.coinPairs[Math.floor(Math.random() * bot.coinPairs.length)],
          buyExchange: bot.exchanges[0],
          sellExchange: bot.exchanges[Math.floor(Math.random() * (bot.exchanges.length - 1)) + 1] ?? bot.exchanges[1],
          buyPrice,
          sellPrice,
          spreadPct,
          estimatedProfit,
          status: estimatedProfit > 0 ? "completed" : "missed",
          detectedAt: new Date(),
        };
        const newOpps = [opp, ...bot.recentOpportunities].slice(0, 20);
        const updatedBot = {
          ...bot,
          recentOpportunities: newOpps,
          opportunitiesDetected: bot.opportunitiesDetected + 1,
          opportunitiesExecuted: estimatedProfit > 0 ? bot.opportunitiesExecuted + 1 : bot.opportunitiesExecuted,
          tradeCount: estimatedProfit > 0 ? bot.tradeCount + 1 : bot.tradeCount,
          totalPnl: estimatedProfit > 0 ? parseFloat((bot.totalPnl + estimatedProfit).toFixed(2)) : bot.totalPnl,
        };
        if (selected?.id === bot.id) {
          setLiveOpps(newOpps);
          setNewOppId(opp.id);
          setTimeout(() => setNewOppId(null), 1500);
        }
        return updatedBot;
      }));
    }, 5000);
    return () => clearInterval(id);
  }, [selected]);

  const handleAction = useCallback((id: string, action: "start" | "pause" | "stop") => {
    setBots(prev => prev.map(b => b.id === id ? { ...b, status: action === "start" ? "running" : action === "pause" ? "paused" : "stopped" } : b));
  }, []);

  const handleSimulate = useCallback((id: string) => {
    setBots(prev => prev.map(bot => {
      if (bot.id !== id) return bot;
      const spreadPct = parseFloat((Math.random() * 0.6 + 0.12).toFixed(3));
      const basePrice = 67240;
      const buyPrice = basePrice;
      const sellPrice = parseFloat((basePrice * (1 + spreadPct / 100)).toFixed(2));
      const estimatedProfit = parseFloat(((sellPrice - buyPrice) * (bot.maxInvestmentPerTrade / buyPrice) - (bot.feePerSide * 2 / 100 * bot.maxInvestmentPerTrade)).toFixed(2));
      const opp: ArbitrageOpportunity = {
        id: `ao${Date.now()}`,
        coinPair: "BTC/USDT",
        buyExchange: bot.exchanges[0],
        sellExchange: bot.exchanges[1] ?? "Bybit",
        buyPrice,
        sellPrice,
        spreadPct,
        estimatedProfit,
        status: "completed",
        detectedAt: new Date(),
      };
      const newOpps = [opp, ...bot.recentOpportunities].slice(0, 20);
      if (selected?.id === id) {
        setLiveOpps(newOpps);
        setNewOppId(opp.id);
        setTimeout(() => setNewOppId(null), 1500);
      }
      return {
        ...bot,
        recentOpportunities: newOpps,
        opportunitiesDetected: bot.opportunitiesDetected + 1,
        opportunitiesExecuted: bot.opportunitiesExecuted + 1,
        tradeCount: bot.tradeCount + 1,
        totalPnl: parseFloat((bot.totalPnl + estimatedProfit).toFixed(2)),
      };
    }));
  }, [selected]);

  const handleSelect = (bot: ArbitrageBot) => {
    setSelected(bot);
    setLiveOpps(bot.recentOpportunities);
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const newBot: ArbitrageBot = {
      id: `arb${Date.now()}`,
      name: form.name.toUpperCase(),
      coinPairs: form.coinPairs.split(",").map(s => s.trim()).filter(Boolean),
      exchanges: form.exchanges.split(",").map(s => s.trim()).filter(Boolean),
      mode: "simulation",
      status: "stopped",
      minSpreadPct: parseFloat(form.minSpreadPct) || 0.1,
      maxInvestmentPerTrade: parseFloat(form.maxInvestmentPerTrade) || 500,
      feePerSide: parseFloat(form.feePerSide) || 0.1,
      executionDelayMs: 150,
      maxDailyTrades: 50,
      maxDailyLoss: 100,
      totalPnl: 0,
      tradeCount: 0,
      opportunitiesDetected: 0,
      opportunitiesExecuted: 0,
      avgSpreadCapture: 0,
      winRate: 0,
      pnlHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, pnl: 0 })),
      recentOpportunities: [],
    };
    setBots(prev => [newBot, ...prev]);
    setCreating(false);
    setForm({ name: "", exchanges: "Binance,Bybit", coinPairs: "BTC/USDT,ETH/USDT", minSpreadPct: "0.1", maxInvestmentPerTrade: "500", feePerSide: "0.1" });
  };

  const totalPnl = bots.reduce((s, b) => s + b.totalPnl, 0);
  const totalTrades = bots.reduce((s, b) => s + b.tradeCount, 0);
  const totalDetected = bots.reduce((s, b) => s + b.opportunitiesDetected, 0);
  const totalExecuted = bots.reduce((s, b) => s + b.opportunitiesExecuted, 0);
  const execRate = totalDetected > 0 ? ((totalExecuted / totalDetected) * 100).toFixed(1) : "0.0";

  const inp: React.CSSProperties = { width: "100%", background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.18)", borderRadius: 5, padding: "7px 10px", color: "rgba(255,255,255,0.85)", fontFamily: C.mono, fontSize: 11, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontFamily: C.mono, fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, display: "block" };

  return (
    <LunaLayout title="ARBITRAGE BOT" subtitle="V5 · Multi-exchange spread detection & execution engine">
      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Arb PnL" value={`$${totalPnl.toFixed(0)}`} sub={`${totalTrades} trades`} accent="green" icon="⚡" />
        <MetricTile label="Opportunities" value={totalDetected} sub={`${execRate}% executed`} accent="cyan" icon="◈" />
        <MetricTile label="Running Bots" value={bots.filter(b => b.status === "running").length} sub={`of ${bots.length} total`} accent="violet" icon="◆" />
        <MetricTile label="Avg Win Rate" value={`${bots.length ? (bots.reduce((s, b) => s + b.winRate, 0) / bots.length).toFixed(1) : 0}%`} sub="across all bots" accent="amber" icon="▲" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
        {/* Bot list */}
        <div>
          <SectionHeader title="ARB BOTS" subtitle={`${bots.length} configured`} accent="cyan"
            right={
              <button onClick={() => setCreating(c => !c)} style={{ fontFamily: C.mono, fontSize: 10, color: C.cyan, background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>
                {creating ? "✕ CANCEL" : "+ NEW BOT"}
              </button>
            }
          />
          {creating && (
            <NeonCard accent="cyan" padding={14} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["Bot Name", "name"], ["Exchanges (comma-sep)", "exchanges"], ["Coin Pairs (comma-sep)", "coinPairs"], ["Min Spread %", "minSpreadPct"], ["Max Invest (USDT)", "maxInvestmentPerTrade"], ["Fee Per Side %", "feePerSide"]].map(([l, k]) => (
                  <div key={k}>
                    <label style={lbl}>{l}</label>
                    <input style={inp} value={form[k as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                  </div>
                ))}
                <button onClick={handleCreate} style={{ fontFamily: C.mono, fontSize: 11, color: C.bg, background: C.cyan, border: "none", borderRadius: 4, padding: "8px", cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em" }}>
                  CREATE BOT
                </button>
              </div>
            </NeonCard>
          )}
          {bots.map(bot => (
            <BotCard key={bot.id} bot={bot} selected={selected?.id === bot.id} onSelect={() => handleSelect(bot)} onAction={handleAction} onSimulate={handleSimulate} />
          ))}
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <>
              <SectionHeader title={`${selected.name} — DETAIL`} subtitle={`${selected.exchanges.join(" / ")} · ${selected.coinPairs.join(", ")}`} accent="green" />

              {/* PnL chart */}
              <NeonCard accent="green" padding={16} style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, marginBottom: 8 }}>CUMULATIVE PnL</div>
                <div style={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bots.find(b => b.id === selected.id)?.pnlHistory ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="arb-detail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.green} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={C.green} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="time" tick={{ fontFamily: C.mono, fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                      <YAxis tick={{ fontFamily: C.mono, fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                      <Tooltip {...TT} formatter={(v: number) => [`$${v.toFixed(2)}`, "PnL"]} />
                      <Area type="monotone" dataKey="pnl" stroke={C.green} strokeWidth={2} fill="url(#arb-detail)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </NeonCard>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                <NeonCard accent="cyan" padding={12}>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>OPPORTUNITIES</div>
                  <div style={{ fontFamily: C.head, fontSize: 22, fontWeight: 700, color: C.cyan }}>{bots.find(b => b.id === selected.id)?.opportunitiesDetected ?? 0}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>detected</div>
                </NeonCard>
                <NeonCard accent="green" padding={12}>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>EXECUTED</div>
                  <div style={{ fontFamily: C.head, fontSize: 22, fontWeight: 700, color: C.green }}>{bots.find(b => b.id === selected.id)?.opportunitiesExecuted ?? 0}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>
                    {bots.find(b => b.id === selected.id)?.opportunitiesDetected
                      ? `${((bots.find(b => b.id === selected.id)!.opportunitiesExecuted / bots.find(b => b.id === selected.id)!.opportunitiesDetected) * 100).toFixed(1)}% rate`
                      : "0% rate"}
                  </div>
                </NeonCard>
                <NeonCard accent="amber" padding={12}>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>WIN RATE</div>
                  <div style={{ fontFamily: C.head, fontSize: 22, fontWeight: 700, color: C.amber }}>{bots.find(b => b.id === selected.id)?.winRate ?? 0}%</div>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>avg spread +{bots.find(b => b.id === selected.id)?.avgSpreadCapture ?? 0}%</div>
                </NeonCard>
              </div>

              {/* Recent opportunities */}
              <SectionHeader title="RECENT OPPORTUNITIES" subtitle="Live spread captures" accent="amber" />
              <NeonCard accent="amber" padding={0} style={{ overflow: "hidden" }}>
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {liveOpps.length === 0 ? (
                    <div style={{ padding: 20, textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.muted }}>
                      No opportunities yet — start the bot to begin scanning
                    </div>
                  ) : liveOpps.map(opp => (
                    <div key={opp.id} style={{ transition: "background 0.3s", background: opp.id === newOppId ? "rgba(0,245,255,0.06)" : "transparent" }}>
                      <OpportunityRow opp={opp} />
                    </div>
                  ))}
                </div>
              </NeonCard>
            </>
          ) : (
            <NeonCard accent="cyan" padding={40} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted }}>Select a bot to view details</div>
            </NeonCard>
          )}
        </div>
      </div>
    </LunaLayout>
  );
}
