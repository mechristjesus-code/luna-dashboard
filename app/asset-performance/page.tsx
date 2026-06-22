"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { SEED_WALLET_ACCOUNTS } from "@/lib/luna/data";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em",
  textTransform: "uppercase", marginBottom: 4, display: "block",
};

const monoSm: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.4)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(0,245,255,0.04)",
  border: "1px solid rgba(0,245,255,0.18)", borderRadius: 5,
  padding: "7px 10px", color: "rgba(255,255,255,0.85)",
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11,
  outline: "none", boxSizing: "border-box",
};

const btnStyle = (color: string, bg: string, border: string): React.CSSProperties => ({
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11,
  letterSpacing: "0.1em", fontWeight: 700, padding: "7px 18px",
  borderRadius: 5, cursor: "pointer", border: `1px solid ${border}`,
  background: bg, color, transition: "opacity 0.15s",
});

export default function AssetPerformancePage() {
  const [autoSweepSettings, setAutoSweepSettings] = useState({
    enabled: true,
    percentage: 20,
    targetAccount: "wallet_savings",
    frequency: "after_each_trade",
  });

  const [showAutoSweepModal, setShowAutoSweepModal] = useState(false);

  // Asset performance data
  const assetPerformance = [
    { symbol: "BTC", balance: 1.3, priceUsd: 42000, value: 54600, change24h: 2.3, change7d: 8.5, volatility: 38.4, pnl: 4200, pnlPercent: 8.3 },
    { symbol: "ETH", balance: 8.2, priceUsd: 1800, value: 14760, change24h: 1.8, change7d: 5.2, volatility: 44.2, pnl: 1850, pnlPercent: 14.3 },
    { symbol: "SOL", balance: 120, priceUsd: 145, value: 17400, change24h: 3.1, change7d: 12.1, volatility: 62.8, pnl: 2100, pnlPercent: 13.7 },
    { symbol: "USDT", balance: 16150.75, priceUsd: 1.0, value: 16150.75, change24h: 0.0, change7d: 0.0, volatility: 0.1, pnl: 0, pnlPercent: 0 },
  ];

  // Historical PnL by asset
  const pnlHistory = [
    { date: "Jun 16", BTC: 3200, ETH: 1100, SOL: 950, USDT: 0 },
    { date: "Jun 17", BTC: 3600, ETH: 1350, SOL: 1200, USDT: 0 },
    { date: "Jun 18", BTC: 3400, ETH: 1250, SOL: 1100, USDT: 0 },
    { date: "Jun 19", BTC: 4000, ETH: 1500, SOL: 1400, USDT: 0 },
    { date: "Jun 20", BTC: 3800, ETH: 1400, SOL: 1300, USDT: 0 },
    { date: "Jun 21", BTC: 4200, ETH: 1850, SOL: 2100, USDT: 0 },
    { date: "Jun 22", BTC: 4200, ETH: 1850, SOL: 2100, USDT: 0 },
  ];

  // Auto-sweep history
  const autoSweepHistory = [
    { date: "Jun 22", amount: 850, asset: "USDT", from: "Trading", to: "Savings", status: "completed" },
    { date: "Jun 21", amount: 420, asset: "USDT", from: "Trading", to: "Savings", status: "completed" },
    { date: "Jun 20", amount: 680, asset: "USDT", from: "Trading", to: "Savings", status: "completed" },
    { date: "Jun 19", amount: 540, asset: "USDT", from: "Trading", to: "Savings", status: "completed" },
  ];

  const handleSaveAutoSweep = () => {
    setShowAutoSweepModal(false);
    alert("Auto-sweep settings updated successfully!");
  };

  return (
    <LunaLayout title="ASSET PERFORMANCE" subtitle="V2.0 · Track holdings, PnL by asset, and auto-sweep profits">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Top Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <NeonCard accent="cyan" padding={16}>
            <div style={labelStyle}>Total Holdings</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#00F5FF", marginBottom: 4 }}>
              $102,910.75
            </div>
            <div style={{ ...monoSm }}>4 assets tracked</div>
          </NeonCard>
          <NeonCard accent="green" padding={16}>
            <div style={labelStyle}>Total Unrealized PnL</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#00FF88", marginBottom: 4 }}>
              $8,150
            </div>
            <div style={{ ...monoSm }}>↑ 8.6% portfolio gain</div>
          </NeonCard>
          <NeonCard accent="magenta" padding={16}>
            <div style={labelStyle}>Best Performer</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#FF006E", marginBottom: 4 }}>
              SOL
            </div>
            <div style={{ ...monoSm }}>+13.7% PnL this month</div>
          </NeonCard>
          <NeonCard accent="amber" padding={16}>
            <div style={labelStyle}>Auto-Sweep Status</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#FFB703", marginBottom: 4 }}>
              ACTIVE
            </div>
            <div style={{ ...monoSm }}>20% of profits → Savings</div>
          </NeonCard>
        </div>

        {/* Asset Holdings Table */}
        <NeonCard accent="cyan" padding={16}>
          <SectionHeader title="ASSET HOLDINGS" subtitle="Current positions and performance" accent="cyan" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,245,255,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Asset</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Balance</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Price</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>USD Value</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>24h</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>7d</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Volatility</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>PnL</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>PnL %</th>
                </tr>
              </thead>
              <tbody>
                {assetPerformance.map((asset) => (
                  <tr key={asset.symbol} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,245,255,0.02)" }}>
                    <td style={{ padding: "8px 4px", color: "#00F5FF", fontWeight: 600 }}>{asset.symbol}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{asset.balance.toFixed(4)}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>${asset.priceUsd.toLocaleString()}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88" }}>${asset.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: asset.change24h > 0 ? "#00FF88" : "#FF006E" }}>
                      {asset.change24h > 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: asset.change7d > 0 ? "#00FF88" : "#FF006E" }}>
                      {asset.change7d > 0 ? "+" : ""}{asset.change7d.toFixed(2)}%
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#FFB703" }}>{asset.volatility.toFixed(1)}%</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: asset.pnl > 0 ? "#00FF88" : "#FF006E" }}>
                      {asset.pnl > 0 ? "+" : ""}{asset.pnl.toFixed(0)}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: asset.pnlPercent > 0 ? "#00FF88" : "#FF006E", fontWeight: 600 }}>
                      {asset.pnlPercent > 0 ? "+" : ""}{asset.pnlPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeonCard>

        {/* PnL by Asset Chart */}
        <NeonCard accent="green" padding={16}>
          <SectionHeader title="PNL TREND BY ASSET" subtitle="7-day performance breakdown" accent="green" />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pnlHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6 }} />
              <Legend />
              <Line type="monotone" dataKey="BTC" stroke="#F7931A" strokeWidth={2} />
              <Line type="monotone" dataKey="ETH" stroke="#627EEA" strokeWidth={2} />
              <Line type="monotone" dataKey="SOL" stroke="#14F195" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </NeonCard>

        {/* Auto-Sweep Configuration */}
        <NeonCard accent="magenta" padding={16}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionHeader title="AUTO-SWEEP CONFIGURATION" subtitle="Automatically move profits to savings" accent="magenta" />
            <button style={btnStyle("#FF006E", "rgba(255,0,110,0.1)", "rgba(255,0,110,0.4)")} onClick={() => setShowAutoSweepModal(true)}>
              ⚙ CONFIGURE
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "rgba(255,0,110,0.05)", border: "1px solid rgba(255,0,110,0.2)", borderRadius: 6, padding: 12 }}>
              <div style={labelStyle}>Status</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 14, fontWeight: 700, color: "#00FF88" }}>
                {autoSweepSettings.enabled ? "✓ ENABLED" : "✗ DISABLED"}
              </div>
            </div>
            <div style={{ background: "rgba(255,0,110,0.05)", border: "1px solid rgba(255,0,110,0.2)", borderRadius: 6, padding: 12 }}>
              <div style={labelStyle}>Sweep Percentage</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 14, fontWeight: 700, color: "#FF006E" }}>
                {autoSweepSettings.percentage}%
              </div>
            </div>
            <div style={{ background: "rgba(255,0,110,0.05)", border: "1px solid rgba(255,0,110,0.2)", borderRadius: 6, padding: 12 }}>
              <div style={labelStyle}>Target Account</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, fontWeight: 700, color: "#FFB703" }}>
                Profit Savings Vault
              </div>
            </div>
            <div style={{ background: "rgba(255,0,110,0.05)", border: "1px solid rgba(255,0,110,0.2)", borderRadius: 6, padding: 12 }}>
              <div style={labelStyle}>Frequency</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, fontWeight: 700, color: "#00F5FF" }}>
                After Each Trade
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, padding: 12 }}>
            <div style={labelStyle}>How It Works</div>
            <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: "1.6" }}>
              After each profitable bot trade, {autoSweepSettings.percentage}% of the profit is automatically transferred to your {autoSweepSettings.targetAccount === "wallet_savings" ? "Profit Savings Vault" : "selected account"}. This helps you lock in gains and reduce trading capital volatility.
            </div>
          </div>
        </NeonCard>

        {/* Auto-Sweep History */}
        <NeonCard accent="amber" padding={16}>
          <SectionHeader title="AUTO-SWEEP HISTORY" subtitle="Recent automatic profit transfers" accent="amber" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,183,3,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Asset</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>From</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>To</th>
                  <th style={{ textAlign: "center", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {autoSweepHistory.map((sweep, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,183,3,0.02)" }}>
                    <td style={{ padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{sweep.date}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88", fontWeight: 600 }}>${sweep.amount}</td>
                    <td style={{ padding: "8px 4px", color: "#FFB703" }}>{sweep.asset}</td>
                    <td style={{ padding: "8px 4px", color: "rgba(255,255,255,0.6)" }}>{sweep.from}</td>
                    <td style={{ padding: "8px 4px", color: "rgba(255,255,255,0.6)" }}>{sweep.to}</td>
                    <td style={{ textAlign: "center", padding: "8px 4px", color: "#00FF88" }}>✓ {sweep.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeonCard>

      </div>

      {/* Auto-Sweep Configuration Modal */}
      {showAutoSweepModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <NeonCard accent="magenta" padding={24} style={{ maxWidth: 500 }}>
            <SectionHeader title="CONFIGURE AUTO-SWEEP" subtitle="Set up automatic profit transfers" accent="magenta" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={autoSweepSettings.enabled} onChange={e => setAutoSweepSettings({...autoSweepSettings, enabled: e.target.checked})} />
                <span style={labelStyle}>Enable Auto-Sweep</span>
              </label>

              <div>
                <label style={labelStyle}>Sweep Percentage (%)</label>
                <input style={inputStyle} type="number" min={1} max={100} value={autoSweepSettings.percentage} onChange={e => setAutoSweepSettings({...autoSweepSettings, percentage: parseInt(e.target.value)})} />
              </div>

              <div>
                <label style={labelStyle}>Target Account</label>
                <select style={inputStyle} value={autoSweepSettings.targetAccount} onChange={e => setAutoSweepSettings({...autoSweepSettings, targetAccount: e.target.value})}>
                  <option value="wallet_savings">Profit Savings Vault</option>
                  <option value="wallet_emergency">Emergency Reserve</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Frequency</label>
                <select style={inputStyle} value={autoSweepSettings.frequency} onChange={e => setAutoSweepSettings({...autoSweepSettings, frequency: e.target.value})}>
                  <option value="after_each_trade">After Each Trade</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div style={{ background: "rgba(255,0,110,0.05)", border: "1px solid rgba(255,0,110,0.2)", borderRadius: 6, padding: 10 }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#FF006E" }}>
                  ⚠ This will automatically transfer {autoSweepSettings.percentage}% of bot profits to your {autoSweepSettings.targetAccount === "wallet_savings" ? "Savings" : "Emergency"} account.
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnStyle("#FF006E", "rgba(255,0,110,0.1)", "rgba(255,0,110,0.4)")} onClick={handleSaveAutoSweep} style={{ flex: 1 }}>
                  SAVE SETTINGS
                </button>
                <button style={btnStyle("#00F5FF", "rgba(0,245,255,0.1)", "rgba(0,245,255,0.4)")} onClick={() => setShowAutoSweepModal(false)} style={{ flex: 1 }}>
                  CANCEL
                </button>
              </div>
            </div>
          </NeonCard>
        </div>
      )}
    </LunaLayout>
  );
}
