"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge } from "@/components/luna/PulseIndicator";
import { SEED_SMART_TRADES, SmartTrade } from "@/lib/luna/data";

const mono = "var(--font-jetbrains-mono, monospace)";
const head = "var(--font-inter-tight, sans-serif)";
const inp: React.CSSProperties = { background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.18)", borderRadius: 5, padding: "7px 10px", color: "#fff", fontFamily: mono, fontSize: 11, outline: "none", width: "100%", boxSizing: "border-box" };
const lbl: React.CSSProperties = { fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, display: "block" };

export default function SmartTradePage() {
  const [trades, setTrades] = useState<SmartTrade[]>(SEED_SMART_TRADES);
  const [form, setForm] = useState({ coinPair: "BTC/USDT", exchange: "Binance", direction: "long", entry: "", qty: "", tp: "3", sl: "2", trailingStop: "1", trailingTP: "0.5" });

  const open = trades.filter(t => t.status === "open");
  const totalUnrealized = open.reduce((s, t) => s + t.unrealizedPnl, 0);
  const totalRealized = trades.filter(t => t.status === "closed").reduce((s, t) => s + t.realizedPnl, 0);

  function createTrade() {
    if (!form.entry || !form.qty) return;
    const entry = parseFloat(form.entry);
    const qty = parseFloat(form.qty);
    const t: SmartTrade = {
      id: `st${Date.now()}`, coinPair: form.coinPair, exchange: form.exchange,
      direction: form.direction as "long" | "short", status: "open",
      entryPrice: entry, currentPrice: entry * (1 + (Math.random() - 0.5) * 0.04),
      quantity: qty, takeProfitPct: parseFloat(form.tp), stopLossPct: parseFloat(form.sl),
      trailingStopPct: parseFloat(form.trailingStop), trailingTPPct: parseFloat(form.trailingTP),
      unrealizedPnl: 0, realizedPnl: 0, openedAt: new Date(),
    };
    t.unrealizedPnl = parseFloat(((t.currentPrice - entry) * qty * (form.direction === "short" ? -1 : 1)).toFixed(2));
    setTrades(p => [...p, t]);
  }

  function closeTrade(id: string) {
    setTrades(p => p.map(t => {
      if (t.id !== id) return t;
      return { ...t, status: "closed", realizedPnl: t.unrealizedPnl, unrealizedPnl: 0 };
    }));
  }

  return (
    <LunaLayout title="SMARTTRADE" subtitle="Advanced manual trading · Trailing TP/SL · Concurrent orders · V5 Execution Agent">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Open Trades" value={open.length} accent="cyan" />
        <MetricTile label="Unrealized PnL" value={`${totalUnrealized >= 0 ? "+" : ""}$${totalUnrealized.toFixed(2)}`} accent={totalUnrealized >= 0 ? "green" : "magenta"} />
        <MetricTile label="Realized PnL" value={`${totalRealized >= 0 ? "+" : ""}$${totalRealized.toFixed(2)}`} accent={totalRealized >= 0 ? "green" : "magenta"} />
        <MetricTile label="Closed Trades" value={trades.filter(t => t.status === "closed").length} accent="violet" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14 }}>
        {/* Trades list */}
        <div>
          <SectionHeader title="OPEN TRADES" accent="cyan" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {trades.map(trade => {
              const pnlColor = trade.unrealizedPnl >= 0 ? "#00FF88" : "#FF006E";
              const tpPrice = trade.entryPrice * (1 + trade.takeProfitPct / 100 * (trade.direction === "long" ? 1 : -1));
              const slPrice = trade.entryPrice * (1 - trade.stopLossPct / 100 * (trade.direction === "long" ? 1 : -1));
              return (
                <NeonCard key={trade.id} accent={trade.status === "closed" ? "violet" : "cyan"} padding={14}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: head, fontWeight: 700, fontSize: 14, color: "#fff" }}>{trade.coinPair}</span>
                        <span style={{ fontFamily: mono, fontSize: 9, color: trade.direction === "long" ? "#00FF88" : "#FF006E", border: `1px solid ${trade.direction === "long" ? "rgba(0,255,136,0.3)" : "rgba(255,0,110,0.3)"}`, borderRadius: 3, padding: "1px 6px" }}>{trade.direction.toUpperCase()}</span>
                        <StatusBadge status={trade.status === "open" ? "running" : trade.status === "closed" ? "stopped" : "idle"} />
                        <span style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{trade.exchange}</span>
                      </div>
                      <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                        Entry: ${trade.entryPrice.toLocaleString()} · Qty: {trade.quantity} · Current: ${trade.currentPrice.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: head, fontWeight: 700, fontSize: 18, color: trade.status === "closed" ? (trade.realizedPnl >= 0 ? "#00FF88" : "#FF006E") : pnlColor }}>
                        {trade.status === "closed" ? `$${trade.realizedPnl.toFixed(2)}` : `${trade.unrealizedPnl >= 0 ? "+" : ""}$${trade.unrealizedPnl.toFixed(2)}`}
                      </div>
                      <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{trade.status === "closed" ? "realized" : "unrealized"}</div>
                    </div>
                  </div>
                  {/* TP/SL visual bar */}
                  {trade.status === "open" && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: mono, fontSize: 9 }}>
                        <span style={{ color: "#FF006E" }}>SL ${slPrice.toFixed(0)} (-{trade.stopLossPct}%)</span>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>Entry ${trade.entryPrice.toFixed(0)}</span>
                        <span style={{ color: "#00FF88" }}>TP ${tpPrice.toFixed(0)} (+{trade.takeProfitPct}%)</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, position: "relative" }}>
                        <div style={{ position: "absolute", left: "50%", top: -2, width: 2, height: 8, background: "#FFB700", borderRadius: 1 }} />
                        <div style={{ height: "100%", width: "50%", background: "linear-gradient(90deg, rgba(255,0,110,0.4), rgba(0,255,136,0.4))", borderRadius: 2 }} />
                      </div>
                      {(trade.trailingStopPct > 0 || trade.trailingTPPct > 0) && (
                        <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                          {trade.trailingStopPct > 0 && <span style={{ fontFamily: mono, fontSize: 9, color: "#FFB700", border: "1px solid rgba(255,183,0,0.2)", borderRadius: 3, padding: "1px 5px" }}>Trailing SL {trade.trailingStopPct}%</span>}
                          {trade.trailingTPPct > 0 && <span style={{ fontFamily: mono, fontSize: 9, color: "#00F5FF", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 3, padding: "1px 5px" }}>Trailing TP {trade.trailingTPPct}%</span>}
                        </div>
                      )}
                    </div>
                  )}
                  {trade.status === "open" && (
                    <button onClick={() => closeTrade(trade.id)} style={{ fontFamily: mono, fontSize: 9, color: "#FF006E", border: "1px solid rgba(255,0,110,0.3)", borderRadius: 4, padding: "4px 12px", background: "transparent", cursor: "pointer" }}>■ CLOSE TRADE</button>
                  )}
                </NeonCard>
              );
            })}
          </div>
        </div>

        {/* New trade form */}
        <div>
          <SectionHeader title="NEW SMART TRADE" accent="violet" />
          <NeonCard accent="violet" padding={16}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["Coin Pair", "coinPair"], ["Exchange", "exchange"]].map(([l, k]) => (
                <div key={k}><label style={lbl}>{l}</label><input style={inp} value={form[k as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
              ))}
              <div><label style={lbl}>Direction</label>
                <select style={inp} value={form.direction} onChange={e => setForm(f => ({ ...f, direction: e.target.value }))}>
                  <option value="long">Long</option><option value="short">Short</option>
                </select>
              </div>
              {[["Entry Price", "entry"], ["Quantity", "qty"], ["Take Profit %", "tp"], ["Stop Loss %", "sl"], ["Trailing Stop %", "trailingStop"], ["Trailing TP %", "trailingTP"]].map(([l, k]) => (
                <div key={k}><label style={lbl}>{l}</label><input type="number" style={inp} value={form[k as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
              ))}
              <button onClick={createTrade} style={{ fontFamily: mono, fontSize: 11, color: "#00F5FF", border: "1px solid rgba(0,245,255,0.4)", borderRadius: 5, padding: "9px 16px", background: "rgba(0,245,255,0.06)", cursor: "pointer", letterSpacing: "0.1em" }}>
                OPEN SMART TRADE
              </button>
            </div>
          </NeonCard>
        </div>
      </div>
    </LunaLayout>
  );
}
