"use client";
import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge, LiveBadge, PulseIndicator } from "@/components/luna/PulseIndicator";
import { SEED_SIGNAL_BOTS, SignalBot, formatTime } from "@/lib/luna/data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

function sourceColor(src: SignalBot["signalSource"]) {
  return src === "TradingView" ? C.violet : src === "LUNA" ? C.cyan : C.amber;
}

function BotCard({ bot, selected, onSelect, onAction }: {
  bot: SignalBot; selected: boolean;
  onSelect: () => void;
  onAction: (id: string, a: "start" | "pause" | "stop") => void;
}) {
  const execRate = bot.signalsReceived > 0 ? ((bot.signalsExecuted / bot.signalsReceived) * 100).toFixed(1) : "0.0";
  const border = selected ? C.cyan : "rgba(0,245,255,0.15)";
  return (
    <div onClick={onSelect} style={{ background: C.panel, border: `1px solid ${border}`, boxShadow: selected ? `0 0 18px rgba(0,245,255,0.18)` : `0 0 10px rgba(0,245,255,0.05)`, borderRadius: 8, padding: 14, cursor: "pointer", marginBottom: 12, transition: "box-shadow 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.head, fontWeight: 700, fontSize: 13, color: C.cyan }}>{bot.name}</span>
        <Chip color={C.cyan}>{bot.coinPair}</Chip>
        <Chip color="rgba(255,255,255,0.5)">{bot.exchange}</Chip>
        <Chip color={sourceColor(bot.signalSource)}>{bot.signalSource}</Chip>
        <StatusBadge status={bot.status} />
        <LiveBadge mode={bot.mode} />
        <span style={{ marginLeft: "auto", fontFamily: C.mono, fontSize: 11, color: bot.totalPnl >= 0 ? C.green : C.magenta, fontWeight: 700 }}>
          {bot.totalPnl >= 0 ? "+" : ""}${bot.totalPnl}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
        <Chip color={C.amber}>MAX: {bot.maxInvestmentPct}%</Chip>
        <Chip color={C.cyan}>ENTRY: {bot.volumePerEntryPct}%</Chip>
        <Chip color={C.violet}>EXIT: {bot.volumePerExitPct}%</Chip>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Entry dev: <span style={{ color: C.amber }}>≥{bot.priceDeviationEntry}%</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>Exit dev: <span style={{ color: C.amber }}>≥{bot.priceDeviationExit}%</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>TP: <span style={{ color: C.green }}>+{bot.takeProfit}%</span></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>SL: <span style={{ color: C.magenta }}>-{bot.stopLoss}%</span></span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>
          <span style={{ color: C.cyan }}>{bot.signalsExecuted}</span>/<span style={{ color: "rgba(255,255,255,0.5)" }}>{bot.signalsReceived}</span> signals · {execRate}% exec rate
          {bot.lastSignalTime && <> · Last: <span style={{ color: C.amber }}>{formatTime(bot.lastSignalTime)}</span></>}
        </span>
      </div>
      <div style={{ height: 60, marginBottom: 9 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bot.pnlHistory} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`sg-${bot.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.35} />
                <stop offset="95%" stopColor={C.violet} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="pnl" stroke={C.cyan} strokeWidth={1.5} fill={`url(#sg-${bot.id})`} dot={false} />
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

function WebhookPanel({ bot }: { bot: SignalBot }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const codeStyle: React.CSSProperties = { fontFamily: C.mono, fontSize: 11, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 5, padding: "10px 12px", color: "rgba(255,255,255,0.8)", overflowX: "auto", whiteSpace: "pre", marginBottom: 10 };
  const signals = Array.from({ length: 6 }, (_, i) => ({
    time: bot.lastSignalTime ? new Date(bot.lastSignalTime.getTime() - i * 7 * 60000) : new Date(Date.now() - i * 7 * 60000),
    executed: i % 3 !== 2,
    reason: i % 3 === 2 ? "Dev filter < " + bot.priceDeviationEntry + "%" : null,
  }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <NeonCard accent="violet" padding={14}>
        <SectionHeader title="WEBHOOK CONFIGURATION" accent="violet" />
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <code style={{ ...codeStyle, flex: 1, marginBottom: 0, fontSize: 10 }}>{bot.webhookUrl}</code>
          <button onClick={copy} style={{ fontFamily: C.mono, fontSize: 10, color: copied ? C.green : C.cyan, background: copied ? "rgba(0,255,136,0.12)" : "rgba(0,245,255,0.12)", border: `1px solid ${copied ? C.green : C.cyan}50`, borderRadius: 4, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap", minWidth: 80 }}>
            {copied ? "COPIED!" : "COPY"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: "0.1em" }}>ENTRY PAYLOAD</div>
            <pre style={codeStyle}>{`{\n  "action": "buy",\n  "pair": "${bot.coinPair}",\n  "volume": "${bot.volumePerEntryPct}%"\n}`}</pre>
          </div>
          <div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: "0.1em" }}>EXIT PAYLOAD</div>
            <pre style={codeStyle}>{`{\n  "action": "sell",\n  "pair": "${bot.coinPair}",\n  "volume": "${bot.volumePerExitPct}%"\n}`}</pre>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, color: C.violet, marginBottom: 4, letterSpacing: "0.1em" }}>TRADINGVIEW PINE SCRIPT</div>
          <pre style={{ ...codeStyle, color: C.cyan }}>
            <span style={{ color: C.muted }}>{"// TradingView Pine Script Alert Message\n"}</span>
            <span style={{ color: C.amber }}>{"strategy"}</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{".alert_message = "}</span>
            <span style={{ color: C.green }}>{`'{"action":"buy","pair":"${bot.coinPair}"}'`}</span>
          </pre>
        </div>
        <div style={{ border: `1px solid ${C.magenta}60`, borderRadius: 5, padding: "8px 12px", background: "rgba(255,0,110,0.06)" }}>
          <span style={{ fontFamily: C.mono, fontSize: 10, color: C.magenta }}>⚠ Never share this webhook URL publicly. If exposed, delete and recreate this bot immediately.</span>
        </div>
      </NeonCard>

      <NeonCard accent="cyan" padding={14}>
        <SectionHeader title="SIGNAL TIMELINE" subtitle="Last 6 signals · deviation filter applied" accent="cyan" />
        <div style={{ marginBottom: 10 }}>
          {signals.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 4, marginBottom: 3, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, minWidth: 60 }}>{formatTime(s.time)}</span>
              {s.executed
                ? <span style={{ fontFamily: C.mono, fontSize: 9, color: C.green, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 3, padding: "1px 6px" }}>EXECUTED</span>
                : <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3, padding: "1px 6px" }}>FILTERED</span>
              }
              {s.reason && <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{s.reason}</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ label: "ENTRY DEV THRESHOLD", val: bot.priceDeviationEntry, color: C.green }, { label: "EXIT DEV THRESHOLD", val: bot.priceDeviationExit, color: C.cyan }].map(({ label, val, color }) => (
            <div key={label}>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 5, letterSpacing: "0.09em" }}>{label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, val * 20)}%`, height: "100%", background: color, boxShadow: `0 0 6px ${color}88`, borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: C.mono, fontSize: 10, color, minWidth: 28 }}>{val}%</span>
              </div>
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  );
}

const COIN_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ARB/USDT"];
const EXCHANGES = ["Binance", "Bybit", "OKX", "KuCoin"];
const SOURCES: SignalBot["signalSource"][] = ["TradingView", "LUNA", "Custom"];

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

type FormState = { name: string; coinPair: string; exchange: string; source: string; maxPct: number; entryPct: number; exitPct: number; tp: number; sl: number; entryDev: number; exitDev: number; };

export default function SignalBotPage() {
  const [bots, setBots] = useState<SignalBot[]>(SEED_SIGNAL_BOTS);
  const [selected, setSelected] = useState<SignalBot>(bots[0]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", coinPair: "BTC/USDT", exchange: "Binance", source: "TradingView", maxPct: 100, entryPct: 100, exitPct: 100, tp: 2.5, sl: 5, entryDev: 1, exitDev: 1 });

  const set = (k: keyof FormState) => (v: string) => {
    const nums = ["maxPct", "entryPct", "exitPct", "tp", "sl", "entryDev", "exitDev"];
    setForm(f => ({ ...f, [k]: nums.includes(k) ? parseFloat(v) || 0 : v }));
  };

  const handleAction = (id: string, a: "start" | "pause" | "stop") => {
    const status = a === "start" ? "running" : a === "pause" ? "paused" : "stopped";
    setBots(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setSelected(prev => prev.id === id ? { ...prev, status } : prev);
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const bot: SignalBot = {
      id: `sig-${Date.now()}`, name: form.name, coinPair: form.coinPair, exchange: form.exchange,
      mode: "simulation", status: "stopped",
      webhookUrl: `https://3commas.io/signal/wh/${Math.random().toString(36).slice(2, 10)}`,
      signalSource: form.source as SignalBot["signalSource"],
      maxInvestmentPct: form.maxPct, volumePerEntryPct: form.entryPct, volumePerExitPct: form.exitPct,
      priceDeviationEntry: form.entryDev, priceDeviationExit: form.exitDev,
      takeProfit: form.tp, stopLoss: form.sl,
      totalPnl: 0, tradeCount: 0, signalsReceived: 0, signalsExecuted: 0, lastSignalTime: null,
      pnlHistory: Array.from({ length: 12 }, (_, i) => ({ time: `${i}h`, pnl: 0 })),
    };
    setBots(p => [...p, bot]);
    setSelected(bot);
    setOpen(false);
    setForm(f => ({ ...f, name: "" }));
  };

  const totalSignals = bots.reduce((s, b) => s + b.signalsReceived, 0);
  const totalExec = bots.reduce((s, b) => s + b.signalsExecuted, 0);
  const execRate = totalSignals > 0 ? ((totalExec / totalSignals) * 100).toFixed(1) : "0.0";
  const totalPnl = bots.reduce((s, b) => s + b.totalPnl, 0);

  return (
    <LunaLayout title="SIGNAL BOT ENGINE" subtitle="Webhook-driven execution · TradingView & LUNA integration · External signal routing">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Signal Bots" value={bots.length} accent="cyan" icon="◈" />
        <MetricTile label="Running" value={bots.filter(b => b.status === "running").length} accent="green" icon="▶" />
        <MetricTile label="Signals Received" value={totalSignals} accent="amber" icon="⚡" />
        <MetricTile label="Exec Rate" value={`${execRate}%`} accent="violet" icon="%" sub={`${totalExec}/${totalSignals}`} />
        <MetricTile label="Total PnL" value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl}`} accent={totalPnl >= 0 ? "green" : "magenta"} icon="Σ" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "58% 42%", gap: 16, marginBottom: 20 }}>
        <div>
          <SectionHeader title="SIGNAL BOTS" subtitle={`${bots.filter(b => b.status === "running").length} running · ${bots.length} total`} accent="cyan" />
          {bots.map(b => (
            <BotCard key={b.id} bot={b} selected={selected?.id === b.id} onSelect={() => setSelected(b)} onAction={handleAction} />
          ))}
        </div>
        <div>
          <SectionHeader title="WEBHOOK & SIGNALS" subtitle="selected bot configuration" accent="violet" />
          {selected && <WebhookPanel bot={selected} />}
        </div>
      </div>
      <NeonCard accent="violet" padding={16}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
          <SectionHeader title="CREATE SIGNAL BOT" accent="violet" />
          <span style={{ fontFamily: C.mono, fontSize: 14, color: C.violet }}>{open ? "▲" : "▼"}</span>
        </div>
        {open && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 12 }}>
            <FormField label="Name" value={form.name} onChange={set("name")} />
            <FormField label="Coin Pair" value={form.coinPair} onChange={set("coinPair")} type="select" options={COIN_PAIRS} />
            <FormField label="Exchange" value={form.exchange} onChange={set("exchange")} type="select" options={EXCHANGES} />
            <FormField label="Signal Source" value={form.source} onChange={set("source")} type="select" options={SOURCES} />
            <FormField label="Max Invest %" value={form.maxPct} onChange={set("maxPct")} type="number" />
            <FormField label="TP %" value={form.tp} onChange={set("tp")} type="number" />
            <FormField label="SL %" value={form.sl} onChange={set("sl")} type="number" />
            <FormField label="Entry Dev %" value={form.entryDev} onChange={set("entryDev")} type="number" />
            <FormField label="Exit Dev %" value={form.exitDev} onChange={set("exitDev")} type="number" />
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button onClick={handleCreate} disabled={!form.name.trim()} style={{ width: "100%", padding: "8px", fontFamily: C.mono, fontSize: 11, fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed", background: form.name.trim() ? `rgba(155,93,229,0.2)` : "rgba(255,255,255,0.04)", border: `1px solid ${form.name.trim() ? C.violet : "rgba(255,255,255,0.1)"}`, borderRadius: 5, color: form.name.trim() ? C.violet : "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                ⊕ CREATE
              </button>
            </div>
          </div>
        )}
      </NeonCard>
    </LunaLayout>
  );
}
