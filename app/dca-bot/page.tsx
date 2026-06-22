"use client";
import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge, LiveBadge, PulseIndicator } from "@/components/luna/PulseIndicator";
import { SEED_DCA_BOTS, DCABot, SafetyOrder, calcSafetyOrders } from "@/lib/luna/data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ── Color tokens ──────────────────────────────────────────────────
const C = {
  bg: "#050810",
  panel: "#0D1526",
  cyan: "#00F5FF",
  violet: "#9B5DE5",
  magenta: "#FF006E",
  green: "#00FF88",
  amber: "#FFB700",
  muted: "rgba(255,255,255,0.38)",
  dim: "rgba(255,255,255,0.12)",
  mono: "var(--font-jetbrains-mono, monospace)",
  head: "var(--font-inter-tight, sans-serif)",
};

// ── Mock base prices for preview ───────────────────────────────────
const BASE_PRICES: Record<string, number> = {
  "BTC/USDT": 67240,
  "ETH/USDT": 3400,
  "SOL/USDT": 155,
  "BNB/USDT": 580,
  "ARB/USDT": 1.12,
};

// ── Helper ─────────────────────────────────────────────────────────
function fmt(n: number, dec = 2) {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: dec });
  return n.toFixed(dec);
}

// ── Sub-components ─────────────────────────────────────────────────

function Chip({ children, color = C.cyan }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      fontFamily: C.mono, fontSize: 10, color, background: `${color}18`,
      border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 7px",
      letterSpacing: "0.06em",
    }}>{children}</span>
  );
}

function SODot({ filled }: { filled: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: filled ? C.cyan : "transparent",
      border: `1.5px solid ${filled ? C.cyan : C.muted}`,
      boxShadow: filled ? `0 0 5px ${C.cyan}` : "none",
    }} />
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: C.mono, fontSize: 10, color, background: `${color}14`,
      border: `1px solid ${color}50`, borderRadius: 4, padding: "4px 10px",
      cursor: "pointer", letterSpacing: "0.1em", transition: "background 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}28`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${color}14`)}
    >{label}</button>
  );
}

// ── Bot Card ───────────────────────────────────────────────────────
function BotCard({ bot, selected, onSelect, onAction }: {
  bot: DCABot; selected: boolean;
  onSelect: () => void;
  onAction: (id: string, action: "start" | "pause" | "stop" | "live") => void;
}) {
  const isRunning = bot.status === "running";
  const borderColor = selected ? C.cyan : "rgba(0,245,255,0.15)";
  return (
    <div onClick={onSelect} style={{
      background: C.panel, border: `1px solid ${borderColor}`,
      boxShadow: selected ? `0 0 18px rgba(0,245,255,0.18), inset 0 1px 0 rgba(255,255,255,0.03)` : `0 0 12px rgba(0,245,255,0.06)`,
      borderRadius: 8, padding: 16, cursor: "pointer", marginBottom: 12,
      transition: "box-shadow 0.2s, border-color 0.2s",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.head, fontWeight: 700, fontSize: 13, color: C.cyan, letterSpacing: "0.04em" }}>
          {bot.name}
        </span>
        <Chip color={C.cyan}>{bot.coinPair}</Chip>
        <span style={{
          fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.5)",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 4, padding: "2px 7px",
        }}>{bot.exchange}</span>
        <StatusBadge status={bot.status} />
        <LiveBadge mode={bot.mode} />
        <span style={{ marginLeft: "auto", fontFamily: C.mono, fontSize: 11, color: bot.totalPnl >= 0 ? C.green : C.magenta, fontWeight: 700 }}>
          {bot.totalPnl >= 0 ? "+" : ""}${fmt(bot.totalPnl)}
        </span>
      </div>

      {/* Strategy row */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>START:</span>
        <Chip color={C.violet}>RSI({bot.rsiPeriod}, {bot.rsiTimeframe}) &lt; {bot.rsiThreshold}</Chip>
      </div>

      {/* Orders row */}
      <div style={{ marginBottom: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          Base <span style={{ color: C.amber }}>${bot.baseOrderSize}</span>
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          SO <span style={{ color: C.amber }}>${bot.safetyOrderSize}</span>
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          <span style={{ color: C.cyan }}>{bot.maxSafetyOrders}</span> SOs
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          Max <span style={{ color: C.violet }}>${fmt(bot.maxBotUsage)}</span>
        </span>
      </div>

      {/* TP/SL row */}
      <div style={{ marginBottom: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          TP: <span style={{ color: C.green }}>+{bot.takeProfit}%</span>
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          SL: <span style={{ color: C.magenta }}>-{bot.stopLoss}%</span>
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          Reinvest: <span style={{ color: C.cyan }}>{bot.reinvestProfit}%</span>
        </span>
      </div>

      {/* Safety order progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>SO FILL:</span>
        {Array.from({ length: bot.maxSafetyOrders }).map((_, i) => (
          <SODot key={i} filled={i < bot.filledSafetyOrders} />
        ))}
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginLeft: 4 }}>
          {bot.filledSafetyOrders}/{bot.maxSafetyOrders}
        </span>
      </div>

      {/* Mini PnL chart */}
      <div style={{ height: 70, marginBottom: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bot.pnlHistory} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`pnl-${bot.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.35} />
                <stop offset="95%" stopColor={C.violet} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="pnl" stroke={C.cyan} strokeWidth={1.5}
              fill={`url(#pnl-${bot.id})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
        {isRunning
          ? <ActionBtn label="⏸ PAUSE" color={C.amber} onClick={() => onAction(bot.id, "pause")} />
          : <ActionBtn label="▶ START" color={C.green} onClick={() => onAction(bot.id, "start")} />
        }
        <ActionBtn label="■ STOP" color={C.magenta} onClick={() => onAction(bot.id, "stop")} />
        <ActionBtn label="⚡ GO LIVE" color={C.amber} onClick={() => onAction(bot.id, "live")} />
      </div>
    </div>
  );
}

// ── Safety Order Table ─────────────────────────────────────────────
function SafetyOrderTable({ bot, onToggle }: {
  bot: DCABot;
  onToggle: (soIndex: number) => void;
}) {
  const maxDev = bot.safetyOrders[bot.safetyOrders.length - 1]?.deviationPct ?? 0;
  const usagePct = Math.min(100, (bot.maxBotUsage / bot.totalBalance) * 100);

  return (
    <NeonCard accent="cyan" padding={14}>
      <SectionHeader
        title={`${bot.name} — SAFETY ORDER LADDER`}
        subtitle={`${bot.coinPair} · ${bot.exchange}`}
        accent="cyan"
      />

      {/* Base price row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
        background: "rgba(0,245,255,0.07)", borderRadius: 6, marginBottom: 4,
        border: "1px solid rgba(0,245,255,0.2)",
      }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.cyan, fontWeight: 700, minWidth: 32 }}>BASE</span>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, flex: 1 }}>Avg: ${fmt(bot.currentAvgPrice, 2)}</span>
        <Chip color={C.cyan}>ENTRY</Chip>
      </div>

      {/* SO rows */}
      <div style={{ overflowY: "auto", maxHeight: 300 }}>
        {bot.safetyOrders.map((so) => (
          <SORow key={so.index} so={so} onToggle={() => onToggle(so.index)} />
        ))}
      </div>

      {/* Capital utilization bar */}
      <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>CAPITAL UTILIZATION</span>
          <span style={{ fontFamily: C.mono, fontSize: 10, color: C.cyan, fontWeight: 700 }}>{usagePct.toFixed(1)}%</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            width: `${usagePct}%`, height: "100%",
            background: `linear-gradient(90deg, ${C.cyan}, ${C.violet})`,
            boxShadow: `0 0 8px ${C.cyan}88`, borderRadius: 3,
            transition: "width 0.4s",
          }} />
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>
            Max Dev: <span style={{ color: C.amber }}>-{maxDev}%</span>
          </span>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>
            Max Usage: <span style={{ color: C.cyan }}>${fmt(bot.maxBotUsage)}</span>
          </span>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>
            Balance: <span style={{ color: C.violet }}>{usagePct.toFixed(1)}% of ${fmt(bot.totalBalance, 0)}</span>
          </span>
        </div>
      </div>
    </NeonCard>
  );
}

function SORow({ so, onToggle }: { so: SafetyOrder; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
      borderRadius: 5, marginBottom: 2, cursor: "pointer",
      background: so.filled ? "rgba(0,255,136,0.05)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${so.filled ? "rgba(0,255,136,0.18)" : "rgba(255,255,255,0.05)"}`,
      transition: "background 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = so.filled ? "rgba(0,255,136,0.09)" : "rgba(255,255,255,0.05)")}
      onMouseLeave={e => (e.currentTarget.style.background = so.filled ? "rgba(0,255,136,0.05)" : "rgba(255,255,255,0.02)")}
    >
      <span style={{
        fontFamily: C.mono, fontSize: 9, fontWeight: 700, minWidth: 30,
        color: C.violet, background: "rgba(155,93,229,0.12)", border: "1px solid rgba(155,93,229,0.3)",
        borderRadius: 3, padding: "1px 5px", textAlign: "center",
      }}>SO{so.index}</span>
      <span style={{ fontFamily: C.mono, fontSize: 9, color: C.magenta, minWidth: 48 }}>-{so.deviationPct}%</span>
      <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.7)", flex: 1 }}>${fmt(so.price, 2)}</span>
      <span style={{ fontFamily: C.mono, fontSize: 9, color: C.amber, minWidth: 52 }}>${fmt(so.orderSize)}</span>
      <span style={{ fontFamily: C.mono, fontSize: 9, color: C.cyan, minWidth: 62 }}>Σ${fmt(so.cumulativeVolume)}</span>
      <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.5)", minWidth: 62 }}>avg ${fmt(so.avgPrice, 2)}</span>
      <span style={{
        fontFamily: C.mono, fontSize: 8, padding: "1px 6px", borderRadius: 3,
        color: so.filled ? C.green : "rgba(255,255,255,0.3)",
        background: so.filled ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${so.filled ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}`,
        letterSpacing: "0.08em",
      }}>{so.filled ? "FILLED" : "PENDING"}</span>
    </div>
  );
}

// ── Create Bot Form ────────────────────────────────────────────────
const COIN_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ARB/USDT"];
const EXCHANGES = ["Binance", "Bybit", "OKX", "KuCoin"];

type FormState = {
  name: string; coinPair: string; exchange: string;
  baseOrder: number; safetyOrder: number; maxSOs: number;
  devStep: number; devMult: number; sizeMult: number;
  tp: number; sl: number; reinvest: number;
};

function FormField({ label, value, onChange, type = "text", options }: {
  label: string; value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number" | "select"; options?: string[];
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)",
    borderRadius: 5, padding: "6px 10px", fontFamily: C.mono, fontSize: 11,
    color: "rgba(255,255,255,0.85)", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  return (
    <div>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: "0.1em" }}>
        {label.toUpperCase()}
      </div>
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle}
          onFocus={e => (e.target.style.borderColor = C.cyan)}
          onBlur={e => (e.target.style.borderColor = "rgba(0,245,255,0.2)")}
        />
      )}
    </div>
  );
}

function CreateBotForm({ onAdd }: { onAdd: (bot: DCABot) => void }) {
  const [form, setForm] = useState<FormState>({
    name: "", coinPair: "BTC/USDT", exchange: "Binance",
    baseOrder: 20, safetyOrder: 15, maxSOs: 3,
    devStep: 1, devMult: 4, sizeMult: 1.7,
    tp: 2.4, sl: 26, reinvest: 100,
  });

  const set = (key: keyof FormState) => (v: string) => {
    const num = ["baseOrder","safetyOrder","maxSOs","devStep","devMult","sizeMult","tp","sl","reinvest"];
    setForm(f => ({ ...f, [key]: num.includes(key) ? parseFloat(v) || 0 : v }));
  };

  const basePrice = BASE_PRICES[form.coinPair] ?? 67240;
  const preview = calcSafetyOrders(
    basePrice, form.baseOrder, form.safetyOrder,
    form.devStep, form.devMult, form.sizeMult, Math.max(1, Math.min(10, form.maxSOs))
  );

  const makePnlHistory = () => Array.from({ length: 12 }, (_, i) => ({ time: `${i}h`, pnl: 0 }));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const id = `dca-${Date.now()}`;
    const bot: DCABot = {
      id, name: form.name, coinPair: form.coinPair, exchange: form.exchange,
      mode: "simulation", status: "stopped",
      baseOrderSize: form.baseOrder, safetyOrderSize: form.safetyOrder,
      maxSafetyOrders: form.maxSOs, deviationStep: form.devStep,
      deviationStepMultiplier: form.devMult, safetyOrderSizeMultiplier: form.sizeMult,
      takeProfit: form.tp, stopLoss: form.sl, stopLossTimeout: 300,
      trailingTP: 0, reinvestProfit: form.reinvest,
      startCondition: "rsi_oversold", rsiPeriod: 14, rsiTimeframe: "1h", rsiThreshold: 30,
      autoCloseDuration: 48, cooldownSec: 0, maxActiveTrades: 1,
      totalBalance: 1000, maxBotUsage: preview[preview.length - 1]?.cumulativeVolume ?? 0,
      currentAvgPrice: basePrice, totalPnl: 0, tradeCount: 0,
      filledSafetyOrders: 0, safetyOrders: preview, pnlHistory: makePnlHistory(),
    };
    onAdd(bot);
    setForm(f => ({ ...f, name: "" }));
  };

  return (
    <NeonCard accent="violet" padding={20}>
      <SectionHeader title="CONFIGURE NEW DCA BOT" subtitle="Full safety order mathematics · real-time preview" accent="violet" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Form fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <FormField label="Bot Name" value={form.name} onChange={set("name")} />
          <FormField label="Coin Pair" value={form.coinPair} onChange={set("coinPair")} type="select" options={COIN_PAIRS} />
          <FormField label="Exchange" value={form.exchange} onChange={set("exchange")} type="select" options={EXCHANGES} />
          <FormField label="Base Order ($)" value={form.baseOrder} onChange={set("baseOrder")} type="number" />
          <FormField label="Safety Order ($)" value={form.safetyOrder} onChange={set("safetyOrder")} type="number" />
          <FormField label="Max Safety Orders" value={form.maxSOs} onChange={set("maxSOs")} type="number" />
          <FormField label="Deviation Step %" value={form.devStep} onChange={set("devStep")} type="number" />
          <FormField label="Step Multiplier" value={form.devMult} onChange={set("devMult")} type="number" />
          <FormField label="Size Multiplier" value={form.sizeMult} onChange={set("sizeMult")} type="number" />
          <FormField label="Take Profit %" value={form.tp} onChange={set("tp")} type="number" />
          <FormField label="Stop Loss %" value={form.sl} onChange={set("sl")} type="number" />
          <FormField label="Reinvest %" value={form.reinvest} onChange={set("reinvest")} type="number" />
          <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
            <button onClick={handleCreate} disabled={!form.name.trim()} style={{
              width: "100%", padding: "10px", fontFamily: C.mono, fontSize: 11,
              fontWeight: 700, letterSpacing: "0.12em", cursor: form.name.trim() ? "pointer" : "not-allowed",
              background: form.name.trim() ? `linear-gradient(90deg, ${C.violet}30, ${C.cyan}18)` : "rgba(255,255,255,0.04)",
              border: `1px solid ${form.name.trim() ? C.violet : "rgba(255,255,255,0.1)"}`,
              borderRadius: 6, color: form.name.trim() ? C.violet : "rgba(255,255,255,0.25)",
              transition: "all 0.2s",
            }}>⊕ CREATE DCA BOT</button>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 8, letterSpacing: "0.12em" }}>
            LIVE PREVIEW — {form.coinPair} @ ${fmt(basePrice)}
          </div>
          <div style={{ overflowY: "auto", maxHeight: 280 }}>
            <div style={{
              display: "flex", gap: 4, padding: "4px 8px",
              background: "rgba(0,245,255,0.07)", borderRadius: 5, marginBottom: 4,
              border: "1px solid rgba(0,245,255,0.18)",
            }}>
              <span style={{ fontFamily: C.mono, fontSize: 9, color: C.cyan, fontWeight: 700, minWidth: 32 }}>BASE</span>
              <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, flex: 1 }}>-0.00%</span>
              <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.7)", flex: 1 }}>${fmt(basePrice)}</span>
              <span style={{ fontFamily: C.mono, fontSize: 9, color: C.amber, flex: 1 }}>${form.baseOrder}</span>
              <span style={{ fontFamily: C.mono, fontSize: 9, color: C.cyan }}>Σ${form.baseOrder}</span>
            </div>
            {preview.map(so => (
              <div key={so.index} style={{
                display: "flex", gap: 4, padding: "4px 8px",
                borderRadius: 5, marginBottom: 2,
                background: "rgba(155,93,229,0.04)",
                border: "1px solid rgba(155,93,229,0.12)",
              }}>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: C.violet, minWidth: 32 }}>SO{so.index}</span>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: C.magenta, flex: 1 }}>-{so.deviationPct}%</span>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.65)", flex: 1 }}>${fmt(so.price, 2)}</span>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: C.amber, flex: 1 }}>${fmt(so.orderSize)}</span>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: C.cyan }}>Σ${fmt(so.cumulativeVolume)}</span>
              </div>
            ))}
          </div>
          {/* Preview summary */}
          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>
              Total: <span style={{ color: C.cyan }}>${fmt(preview[preview.length - 1]?.cumulativeVolume ?? form.baseOrder)}</span>
            </span>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>
              Max Dev: <span style={{ color: C.amber }}>-{preview[preview.length - 1]?.deviationPct ?? 0}%</span>
            </span>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>
              TP: <span style={{ color: C.green }}>+{form.tp}%</span>
            </span>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>
              SL: <span style={{ color: C.magenta }}>-{form.sl}%</span>
            </span>
          </div>
        </div>
      </div>
    </NeonCard>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function DcaBotPage() {
  const [bots, setBots] = useState<DCABot[]>(SEED_DCA_BOTS);
  const [selected, setSelected] = useState<DCABot | null>(bots[0]);

  // Metrics
  const totalBots = bots.length;
  const running = bots.filter(b => b.status === "running").length;
  const totalCapital = bots.reduce((s, b) => s + b.maxBotUsage, 0);
  const totalPnl = bots.reduce((s, b) => s + b.totalPnl, 0);
  const activeSOs = bots.reduce((s, b) => s + b.filledSafetyOrders, 0);

  const handleAction = (id: string, action: "start" | "pause" | "stop" | "live") => {
    setBots(prev => prev.map(b => {
      if (b.id !== id) return b;
      if (action === "start") return { ...b, status: "running" };
      if (action === "pause") return { ...b, status: "paused" };
      if (action === "stop") return { ...b, status: "stopped" };
      if (action === "live") return { ...b, mode: "live" };
      return b;
    }));
    setSelected(prev => {
      if (!prev || prev.id !== id) return prev;
      if (action === "start") return { ...prev, status: "running" };
      if (action === "pause") return { ...prev, status: "paused" };
      if (action === "stop") return { ...prev, status: "stopped" };
      if (action === "live") return { ...prev, mode: "live" };
      return prev;
    });
  };

  const handleSOToggle = (botId: string, soIndex: number) => {
    setBots(prev => prev.map(b => {
      if (b.id !== botId) return b;
      const updated = { ...b, safetyOrders: b.safetyOrders.map(so =>
        so.index === soIndex ? { ...so, filled: !so.filled } : so
      )};
      updated.filledSafetyOrders = updated.safetyOrders.filter(so => so.filled).length;
      return updated;
    }));
    setSelected(prev => {
      if (!prev || prev.id !== botId) return prev;
      const updated = { ...prev, safetyOrders: prev.safetyOrders.map(so =>
        so.index === soIndex ? { ...so, filled: !so.filled } : so
      )};
      updated.filledSafetyOrders = updated.safetyOrders.filter(so => so.filled).length;
      return updated;
    });
  };

  const handleAdd = (bot: DCABot) => {
    setBots(prev => [...prev, bot]);
    setSelected(bot);
  };

  return (
    <LunaLayout title="DCA BOT ENGINE" subtitle="Dollar-Cost Averaging · Safety Orders · Auto-Compounding · V5 Execution Agent">
      {/* Top metrics row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total DCA Bots" value={totalBots} accent="cyan" icon="◈" />
        <MetricTile label="Running" value={running} accent="green" icon="▶" sub={`${totalBots - running} idle`} />
        <MetricTile label="Capital Deployed" value={`$${fmt(totalCapital)}`} accent="amber" icon="◎" />
        <MetricTile label="Total PnL" value={`${totalPnl >= 0 ? "+" : ""}$${fmt(Math.abs(totalPnl))}`}
          accent={totalPnl >= 0 ? "green" : "magenta"} icon="Σ" sub="all bots" />
        <MetricTile label="Active Safety Orders" value={activeSOs} accent="violet" icon="⚡" />
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gap: 16, marginBottom: 20 }}>
        {/* LEFT: Bot cards */}
        <div>
          <SectionHeader title="DCA BOTS" subtitle={`${running} running · ${totalBots} total`} accent="cyan"
            right={<span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>{bots.length} bots</span>}
          />
          {bots.map(bot => (
            <BotCard
              key={bot.id}
              bot={bot}
              selected={selected?.id === bot.id}
              onSelect={() => setSelected(bot)}
              onAction={handleAction}
            />
          ))}
        </div>

        {/* RIGHT: Safety order table */}
        <div>
          <SectionHeader title="SAFETY ORDER LADDER" subtitle="click row to toggle fill status" accent="violet" />
          {selected ? (
            <SafetyOrderTable
              bot={selected}
              onToggle={idx => handleSOToggle(selected.id, idx)}
            />
          ) : (
            <NeonCard accent="violet" padding={20}>
              <div style={{ textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.muted, padding: "40px 0" }}>
                Select a bot to view safety order ladder
              </div>
            </NeonCard>
          )}
        </div>
      </div>

      {/* Create bot form */}
      <CreateBotForm onAdd={handleAdd} />
    </LunaLayout>
  );
}
