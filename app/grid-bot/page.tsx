"use client";
import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge, LiveBadge } from "@/components/luna/PulseIndicator";
import { SEED_GRID_BOTS, GridBot } from "@/lib/luna/data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar } from "recharts";

const C = {
  bg: "#050810", panel: "#0D1526",
  cyan: "#00F5FF", violet: "#9B5DE5", magenta: "#FF006E", green: "#00FF88", amber: "#FFB700",
  muted: "rgba(255,255,255,0.38)", dim: "rgba(255,255,255,0.1)",
  mono: "var(--font-jetbrains-mono, monospace)", head: "var(--font-inter-tight, sans-serif)",
};

function Chip({ children, color = C.cyan }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: C.mono, fontSize: 10, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.06em" }}>
      {children}
    </span>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ fontFamily: C.mono, fontSize: 10, color, background: `${color}14`, border: `1px solid ${color}50`, borderRadius: 4, padding: "4px 10px", cursor: "pointer", letterSpacing: "0.1em" }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}28`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${color}14`)}
    >{label}</button>
  );
}

function BotCard({ bot, selected, onSelect, onAction }: {
  bot: GridBot; selected: boolean;
  onSelect: () => void;
  onAction: (id: string, a: "start" | "pause" | "stop") => void;
}) {
  const mockCurrent = bot.lowerPrice + (bot.upperPrice - bot.lowerPrice) * 0.55;
  const fillPct = ((mockCurrent - bot.lowerPrice) / (bot.upperPrice - bot.lowerPrice)) * 100;
  const border = selected ? C.cyan : "rgba(0,245,255,0.15)";
  return (
    <div onClick={onSelect} style={{ background: C.panel, border: `1px solid ${border}`, boxShadow: selected ? `0 0 18px rgba(0,245,255,0.18)` : `0 0 10px rgba(0,245,255,0.05)`, borderRadius: 8, padding: 14, cursor: "pointer", marginBottom: 12, transition: "box-shadow 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.head, fontWeight: 700, fontSize: 13, color: C.cyan }}>{bot.name}</span>
        <Chip color={C.cyan}>{bot.coinPair}</Chip>
        <Chip color="rgba(255,255,255,0.5)">{bot.exchange}</Chip>
        <StatusBadge status={bot.status} />
        <LiveBadge mode={bot.mode} />
        <span style={{ marginLeft: "auto", fontFamily: C.mono, fontSize: 11, color: C.green, fontWeight: 700 }}>+${bot.gridProfit}</span>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Upper: <span style={{ color: C.cyan }}>${bot.upperPrice.toLocaleString()}</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Lower: <span style={{ color: C.violet }}>${bot.lowerPrice.toLocaleString()}</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Lines: <span style={{ color: C.amber }}>{bot.gridLines}</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Invest: <span style={{ color: C.green }}>${bot.investmentAmount}</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Spacing: <span style={{ color: C.amber }}>{bot.gridSpacing}%</span></span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>PRICE RANGE</span>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.amber }}>Current ≈ ${mockCurrent.toFixed(0)}</span>
        </div>
        <div style={{ height: 12, background: "rgba(255,255,255,0.07)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: `${fillPct}%`, height: "100%", background: `linear-gradient(90deg, ${C.violet}, ${C.cyan})`, borderRadius: 6 }} />
          <div style={{ position: "absolute", left: `${fillPct}%`, top: 0, width: 2, height: "100%", background: C.amber, boxShadow: `0 0 6px ${C.amber}` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.violet }}>${bot.lowerPrice.toLocaleString()}</span>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.cyan }}>${bot.upperPrice.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>{bot.openOrders} open · {bot.filledOrders} filled</span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.green }}>Grid profit: ${bot.gridProfit}</span>
      </div>
      <div style={{ height: 60, marginBottom: 9 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bot.pnlHistory} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grd-${bot.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.35} />
                <stop offset="95%" stopColor={C.violet} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="pnl" stroke={C.cyan} strokeWidth={1.5} fill={`url(#grd-${bot.id})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
        {bot.status === "running"
          ? <ActionBtn label="⏸ PAUSE" color={C.amber} onClick={() => onAction(bot.id, "pause")} />
          : <ActionBtn label="▶ START" color={C.green} onClick={() => onAction(bot.id, "start")} />
        }
        <ActionBtn label="■ STOP" color={C.magenta} onClick={() => onAction(bot.id, "stop")} />
      </div>
    </div>
  );
}

function GridViz({ bot }: { bot: GridBot }) {
  const range = bot.upperPrice - bot.lowerPrice;
  const mockCurrent = bot.lowerPrice + range * 0.55;
  const displayLines = Math.min(10, bot.gridLines);
  const lines = Array.from({ length: displayLines + 1 }, (_, i) => {
    const price = bot.lowerPrice + (range / bot.gridLines) * (i * Math.floor(bot.gridLines / displayLines));
    const isBuy = price < mockCurrent;
    const isCurrent = Math.abs(price - mockCurrent) < range / bot.gridLines / 2;
    const filled = i % 3 === 1;
    return { price, isBuy, isCurrent, filled };
  });

  const profitData = Array.from({ length: 24 }, (_, i) => ({
    h: `${i}h`, profit: parseFloat((bot.gridProfit * (i + 1) / 24 + (Math.random() - 0.3) * 2).toFixed(2)),
    orders: Math.floor(Math.random() * 4 + 1),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <NeonCard accent="cyan" padding={14}>
        <SectionHeader title={`GRID VISUALIZATION — ${bot.coinPair}`} accent="cyan" />
        <div style={{ height: 300, position: "relative", overflow: "hidden" }}>
          {lines.map((line, i) => {
            const topPct = 100 - ((line.price - bot.lowerPrice) / range) * 100;
            const color = line.isCurrent ? C.amber : line.isBuy ? C.green : C.cyan;
            return (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${topPct}%`, display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1, height: line.isCurrent ? 2 : 1, background: color, opacity: line.filled ? 0.9 : 0.35, borderStyle: line.isCurrent ? "dashed" : "solid" }} />
                <div style={{ minWidth: 110, paddingLeft: 8, display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color, opacity: line.filled ? 1 : 0.6 }}>${line.price.toFixed(0)}</span>
                  <span style={{ fontFamily: C.mono, fontSize: 8, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 3, padding: "1px 5px" }}>
                    {line.isCurrent ? "NOW" : line.isBuy ? "BUY" : "SELL"}
                  </span>
                  {line.filled && <span style={{ fontFamily: C.mono, fontSize: 8, color: C.amber }}>●</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
          {[{ c: C.green, l: "BUY (below current)" }, { c: C.cyan, l: "SELL (above current)" }, { c: C.amber, l: "Current price" }, { c: C.amber, l: "● Filled order" }].map(({ c, l }) => (
            <span key={l} style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 10, height: 2, background: c }} />{l}
            </span>
          ))}
        </div>
      </NeonCard>

      <NeonCard accent="violet" padding={14}>
        <SectionHeader title="PROFIT & ORDER FREQUENCY (24H)" accent="violet" />
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={profitData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="h" tick={{ fontFamily: C.mono, fontSize: 8, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontFamily: C.mono, fontSize: 8, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.violet}40`, borderRadius: 6, fontFamily: C.mono, fontSize: 10 }} />
              <defs>
                <linearGradient id={`gp-${bot.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.violet} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.violet} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Bar dataKey="orders" fill={`${C.cyan}30`} stroke={C.cyan} strokeWidth={0.5} />
              <Area type="monotone" dataKey="profit" stroke={C.violet} strokeWidth={1.5} fill={`url(#gp-${bot.id})`} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </NeonCard>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", options }: { label: string; value: string | number; onChange: (v: string) => void; type?: "text" | "number" | "select"; options?: string[] }) {
  const s: React.CSSProperties = { width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 5, padding: "6px 10px", fontFamily: C.mono, fontSize: 11, color: "rgba(255,255,255,0.85)", outline: "none", boxSizing: "border-box" };
  return (
    <div>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 3, letterSpacing: "0.1em" }}>{label.toUpperCase()}</div>
      {type === "select"
        ? <select value={value} onChange={e => onChange(e.target.value)} style={{ ...s, cursor: "pointer" }}>{options?.map(o => <option key={o} value={o}>{o}</option>)}</select>
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} style={s} onFocus={e => (e.target.style.borderColor = C.cyan)} onBlur={e => (e.target.style.borderColor = "rgba(0,245,255,0.2)")} />
      }
    </div>
  );
}

const COIN_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ARB/USDT"];
const EXCHANGES = ["Binance", "Bybit", "OKX", "KuCoin"];
type FormState = { name: string; coinPair: string; exchange: string; upper: number; lower: number; lines: number; invest: number; };

export default function GridBotPage() {
  const [bots, setBots] = useState<GridBot[]>(SEED_GRID_BOTS);
  const [selected, setSelected] = useState<GridBot>(bots[0]);
  const [form, setForm] = useState<FormState>({ name: "", coinPair: "BTC/USDT", exchange: "Binance", upper: 70000, lower: 60000, lines: 20, invest: 500 });

  const set = (k: keyof FormState) => (v: string) => {
    const nums = ["upper", "lower", "lines", "invest"];
    setForm(f => ({ ...f, [k]: nums.includes(k) ? parseFloat(v) || 0 : v }));
  };

  const spacing = form.lower > 0 && form.lines > 0 ? (((form.upper - form.lower) / form.lower / form.lines) * 100).toFixed(3) : "0.000";
  const estProfit = form.invest > 0 && form.lines > 0 ? (form.invest * parseFloat(spacing) / 100).toFixed(2) : "0.00";

  const handleAction = (id: string, a: "start" | "pause" | "stop") => {
    const status = a === "start" ? "running" : a === "pause" ? "paused" : "stopped";
    setBots(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setSelected(prev => prev.id === id ? { ...prev, status } : prev);
  };

  const handleCreate = () => {
    if (!form.name.trim() || form.upper <= form.lower) return;
    const bot: GridBot = {
      id: `grid-${Date.now()}`, name: form.name, coinPair: form.coinPair, exchange: form.exchange,
      mode: "simulation", status: "stopped",
      upperPrice: form.upper, lowerPrice: form.lower, gridLines: form.lines,
      investmentAmount: form.invest, gridSpacing: parseFloat(spacing),
      totalPnl: 0, gridProfit: 0, openOrders: 0, filledOrders: 0,
      pnlHistory: Array.from({ length: 12 }, (_, i) => ({ time: `${i}h`, pnl: 0 })),
    };
    setBots(p => [...p, bot]);
    setSelected(bot);
    setForm(f => ({ ...f, name: "" }));
  };

  const totalOpen = bots.reduce((s, b) => s + b.openOrders, 0);
  const totalFilled = bots.reduce((s, b) => s + b.filledOrders, 0);
  const totalProfit = bots.reduce((s, b) => s + b.gridProfit, 0);

  return (
    <LunaLayout title="GRID BOT ENGINE" subtitle="Range-bound trading · Buy low sell high automation · Sideways market specialist">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Grid Bots" value={bots.length} accent="cyan" icon="◈" />
        <MetricTile label="Open Orders" value={totalOpen} accent="amber" icon="⊡" />
        <MetricTile label="Filled Orders" value={totalFilled} accent="green" icon="✓" />
        <MetricTile label="Total Grid Profit" value={`$${totalProfit}`} accent="violet" icon="Σ" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "50% 50%", gap: 16, marginBottom: 20 }}>
        <div>
          <SectionHeader title="GRID BOTS" subtitle={`${bots.filter(b => b.status === "running").length} running · ${bots.length} total`} accent="cyan" />
          {bots.map(b => (
            <BotCard key={b.id} bot={b} selected={selected?.id === b.id} onSelect={() => setSelected(b)} onAction={handleAction} />
          ))}
        </div>
        <div>
          <SectionHeader title="GRID VISUALIZATION" subtitle="selected bot · live grid levels" accent="violet" />
          {selected && <GridViz bot={selected} />}
        </div>
      </div>

      <NeonCard accent="cyan" padding={16}>
        <SectionHeader title="CREATE GRID BOT" accent="cyan" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 12 }}>
          <FormField label="Name" value={form.name} onChange={set("name")} />
          <FormField label="Coin Pair" value={form.coinPair} onChange={set("coinPair")} type="select" options={COIN_PAIRS} />
          <FormField label="Exchange" value={form.exchange} onChange={set("exchange")} type="select" options={EXCHANGES} />
          <FormField label="Upper Price" value={form.upper} onChange={set("upper")} type="number" />
          <FormField label="Lower Price" value={form.lower} onChange={set("lower")} type="number" />
          <FormField label="Grid Lines" value={form.lines} onChange={set("lines")} type="number" />
          <FormField label="Investment USDT" value={form.invest} onChange={set("invest")} type="number" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 5, padding: "6px 14px", display: "flex", gap: 6 }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Grid Spacing:</span>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.cyan, fontWeight: 700 }}>{spacing}%</span>
          </div>
          <div style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 5, padding: "6px 14px", display: "flex", gap: 6 }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Est. profit/grid fill:</span>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.green, fontWeight: 700 }}>${estProfit}</span>
          </div>
          <button onClick={handleCreate} disabled={!form.name.trim() || form.upper <= form.lower} style={{ padding: "8px 24px", fontFamily: C.mono, fontSize: 11, fontWeight: 700, cursor: form.name.trim() && form.upper > form.lower ? "pointer" : "not-allowed", background: form.name.trim() ? `rgba(0,245,255,0.15)` : "rgba(255,255,255,0.04)", border: `1px solid ${form.name.trim() ? C.cyan : "rgba(255,255,255,0.1)"}`, borderRadius: 5, color: form.name.trim() ? C.cyan : "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
            ⊕ CREATE GRID BOT
          </button>
        </div>
      </NeonCard>
    </LunaLayout>
  );
}
