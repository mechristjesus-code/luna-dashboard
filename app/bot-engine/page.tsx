"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge, LiveBadge } from "@/components/luna/PulseIndicator";
import { SEED_BOTS, SEED_STRATEGIES, TradingBot } from "@/lib/luna/data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COIN_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ARB/USDT"];

const btnBase: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 4,
  fontSize: 10,
  fontFamily: "var(--font-jetbrains-mono, monospace)",
  fontWeight: 700,
  letterSpacing: "0.1em",
  cursor: "pointer",
  background: "transparent",
  transition: "opacity 0.15s",
};

export default function BotEnginePage() {
  const [bots, setBots] = useState<TradingBot[]>(SEED_BOTS);
  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [newBotForm, setNewBotForm] = useState({
    name: "",
    coinPair: "BTC/USDT",
    strategy: "RSI Reversal v2",
    positionSize: "10",
    stopLoss: "5",
  });

  // Derived metrics
  const runningCount = bots.filter((b) => b.status === "running").length;
  const liveCount = bots.filter((b) => b.mode === "live").length;
  const totalBalance = bots.reduce((s, b) => s + b.virtualBalance, 0);
  const totalPnl = bots.reduce((s, b) => s + b.totalPnl, 0);

  // Bot actions
  const updateBot = (id: string, patch: Partial<TradingBot>) =>
    setBots((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const handleGoLive = (bot: TradingBot) => {
    setSelectedBot(bot);
    setShowLiveModal(true);
  };

  const confirmLive = () => {
    if (selectedBot) {
      updateBot(selectedBot.id, { mode: "live" });
    }
    setShowLiveModal(false);
    setSelectedBot(null);
  };

  const handleCreate = () => {
    if (!newBotForm.name.trim()) return;
    const newBot: TradingBot = {
      id: `b${Date.now()}`,
      name: newBotForm.name.toUpperCase(),
      coinPair: newBotForm.coinPair,
      strategy: newBotForm.strategy,
      mode: "simulation",
      status: "stopped",
      virtualBalance: 10000,
      totalPnl: 0,
      tradeCount: 0,
      pnlHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, pnl: 0 })),
    };
    setBots((prev) => [...prev, newBot]);
    setNewBotForm({ name: "", coinPair: "BTC/USDT", strategy: "RSI Reversal v2", positionSize: "10", stopLoss: "5" });
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(0,245,255,0.2)",
    borderRadius: 4,
    padding: "7px 10px",
    color: "#fff",
    fontFamily: "var(--font-jetbrains-mono, monospace)",
    fontSize: 12,
    outline: "none",
    width: "100%",
  };

  return (
    <LunaLayout title="BOT ENGINE" subtitle="Autonomous trading bot management · V5 Execution Agent">
      {/* Top Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        <MetricTile label="Total Bots" value={bots.length} accent="cyan" icon="◆" />
        <MetricTile label="Running Bots" value={runningCount} accent="green" icon="▶" />
        <MetricTile label="Live Mode" value={liveCount} accent="amber" icon="⚡" />
        <MetricTile label="Virtual Balance" value={`$${totalBalance.toLocaleString()}`} accent="violet" icon="◈" />
        <MetricTile
          label="Total PnL"
          value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toLocaleString()}`}
          accent={totalPnl >= 0 ? "green" : "magenta"}
          icon={totalPnl >= 0 ? "▲" : "▼"}
        />
      </div>

      {/* Bot Cards Grid */}
      <SectionHeader title="ACTIVE BOTS" subtitle={`${bots.length} bots deployed`} accent="cyan" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {bots.map((bot) => <BotCard key={bot.id} bot={bot} onUpdate={updateBot} onGoLive={handleGoLive} />)}
      </div>

      {/* Create New Bot */}
      <NeonCard accent="violet" padding={20}>
        <SectionHeader title="CREATE NEW BOT" subtitle="Deploy a new autonomous trading agent" accent="violet" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em", marginBottom: 5 }}>BOT NAME</label>
            <input style={inputStyle} placeholder="e.g. SIGMA-7" value={newBotForm.name} onChange={(e) => setNewBotForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em", marginBottom: 5 }}>COIN PAIR</label>
            <select style={inputStyle} value={newBotForm.coinPair} onChange={(e) => setNewBotForm((f) => ({ ...f, coinPair: e.target.value }))}>
              {COIN_PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em", marginBottom: 5 }}>STRATEGY</label>
            <select style={inputStyle} value={newBotForm.strategy} onChange={(e) => setNewBotForm((f) => ({ ...f, strategy: e.target.value }))}>
              {SEED_STRATEGIES.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em", marginBottom: 5 }}>POSITION SIZE %</label>
            <input type="number" min={1} max={100} style={inputStyle} value={newBotForm.positionSize} onChange={(e) => setNewBotForm((f) => ({ ...f, positionSize: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em", marginBottom: 5 }}>STOP LOSS %</label>
            <input type="number" min={1} style={inputStyle} value={newBotForm.stopLoss} onChange={(e) => setNewBotForm((f) => ({ ...f, stopLoss: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button onClick={handleCreate} style={{ ...btnBase, border: "1px solid rgba(155,93,229,0.6)", color: "#9B5DE5", padding: "8px 20px", fontSize: 11 }}>
            + CREATE BOT
          </button>
        </div>
      </NeonCard>

      {/* Live Mode Modal */}
      {showLiveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,16,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <NeonCard accent="magenta" padding={28} style={{ maxWidth: 440, width: "90%" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>⚠</div>
              <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 16, color: "#FF006E", letterSpacing: "0.08em", marginBottom: 16 }}>
                SWITCH TO LIVE MODE
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 24 }}>
                <strong style={{ color: "#FFB700" }}>This action connects this bot to real exchange APIs and will execute trades with REAL FUNDS.</strong>
                {" "}This involves actual financial risk. Ensure your API keys are configured and you understand the strategy parameters before proceeding.
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => { setShowLiveModal(false); setSelectedBot(null); }} style={{ ...btnBase, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", padding: "9px 20px" }}>
                  CANCEL
                </button>
                <button onClick={confirmLive} style={{ ...btnBase, border: "1px solid #FFB700", color: "#FFB700", padding: "9px 20px", boxShadow: "0 0 14px rgba(255,183,0,0.3)", animation: "pulseAmber 1.5s ease-in-out infinite" }}>
                  CONFIRM LIVE MODE
                </button>
              </div>
            </div>
          </NeonCard>
          <style>{`@keyframes pulseAmber { 0%,100% { box-shadow: 0 0 14px rgba(255,183,0,0.3); } 50% { box-shadow: 0 0 24px rgba(255,183,0,0.6); } }`}</style>
        </div>
      )}
    </LunaLayout>
  );
}

// ── Bot Card Sub-Component ─────────────────────────────────────────
function BotCard({ bot, onUpdate, onGoLive }: { bot: TradingBot; onUpdate: (id: string, p: Partial<TradingBot>) => void; onGoLive: (b: TradingBot) => void }) {
  const pnlColor = bot.totalPnl >= 0 ? "#00FF88" : "#FF006E";

  return (
    <NeonCard accent={bot.mode === "live" ? "amber" : "cyan"} padding={16}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "0.06em" }}>{bot.name}</span>
        <span style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 3, padding: "1px 7px", fontSize: 10, color: "#00F5FF", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.08em" }}>{bot.coinPair}</span>
        <StatusBadge status={bot.status} />
        <LiveBadge mode={bot.mode} />
      </div>

      {/* Strategy & trades */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>{bot.strategy}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>{bot.tradeCount} trades</span>
      </div>

      {/* Balance + PnL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em", marginBottom: 3 }}>VIRTUAL BALANCE</div>
          <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 20, color: "#00F5FF", textShadow: "0 0 8px rgba(0,245,255,0.4)" }}>${bot.virtualBalance.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em", marginBottom: 3 }}>TOTAL PNL</div>
          <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 20, color: pnlColor, textShadow: `0 0 8px ${pnlColor}55` }}>
            {bot.totalPnl >= 0 ? "+" : ""}${bot.totalPnl.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Mini PnL Chart */}
      <div style={{ marginBottom: 12 }}>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={bot.pnlHistory} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <defs>
              <linearGradient id={`fill-${bot.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9B5DE5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9B5DE5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 4, fontSize: 10, fontFamily: "var(--font-jetbrains-mono, monospace)", color: "#00F5FF" }} itemStyle={{ color: "#00F5FF" }} labelStyle={{ color: "rgba(255,255,255,0.4)" }} />
            <Area type="monotone" dataKey="pnl" stroke="#00F5FF" strokeWidth={1.5} fill={`url(#fill-${bot.id})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {bot.status !== "running" && (
          <button onClick={() => onUpdate(bot.id, { status: "running" })} style={{ ...btnBase, border: "1px solid rgba(0,255,136,0.5)", color: "#00FF88", padding: "5px 12px" }}>▶ START</button>
        )}
        {bot.status === "running" && (
          <button onClick={() => onUpdate(bot.id, { status: "paused" })} style={{ ...btnBase, border: "1px solid rgba(255,183,0,0.5)", color: "#FFB700", padding: "5px 12px" }}>⏸ PAUSE</button>
        )}
        {bot.status !== "stopped" && (
          <button onClick={() => onUpdate(bot.id, { status: "stopped" })} style={{ ...btnBase, border: "1px solid rgba(255,0,110,0.5)", color: "#FF006E", padding: "5px 12px" }}>■ STOP</button>
        )}
        {bot.mode === "simulation" ? (
          <button onClick={() => onGoLive(bot)} style={{ ...btnBase, border: "1px solid rgba(255,183,0,0.6)", color: "#FFB700", padding: "5px 12px" }}>⚡ GO LIVE</button>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#FFB700", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.1em", border: "1px solid rgba(255,183,0,0.3)", borderRadius: 4, padding: "5px 10px", background: "rgba(255,183,0,0.06)" }}>⚡ MODE: LIVE</span>
        )}
      </div>
    </NeonCard>
  );
}
