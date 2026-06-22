"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, SectionHeader } from "@/components/luna/NeonCard";
import { SEED_TRANSACTIONS } from "@/lib/luna/data";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em",
  textTransform: "uppercase", marginBottom: 4, display: "block",
};

const monoSm: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10,
  color: "rgba(255,255,255,0.4)",
};

export default function TransactionLedgerPage() {
  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filterType === "all" || tx.type === filterType;
    const statusMatch = filterStatus === "all" || tx.status === filterStatus;
    const searchMatch = searchTerm === "" || 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromAsset.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  const getTxTypeColor = (type: string) => {
    switch(type) {
      case "deposit": return "#00F5FF";
      case "withdrawal": return "#FF006E";
      case "transfer": return "#00FF88";
      case "bot_profit": return "#9B5DE5";
      case "auto_sweep": return "#FFB703";
      case "fee": return "#FF6B6B";
      default: return "rgba(255,255,255,0.5)";
    }
  };

  const getTxTypeIcon = (type: string) => {
    switch(type) {
      case "deposit": return "⬇";
      case "withdrawal": return "⬆";
      case "transfer": return "↔";
      case "bot_profit": return "💰";
      case "auto_sweep": return "🔄";
      case "fee": return "⚡";
      default: return "•";
    }
  };

  const getTxStatusColor = (status: string) => {
    switch(status) {
      case "completed": return "#00FF88";
      case "pending": return "#FFB703";
      case "failed": return "#FF006E";
      case "cancelled": return "rgba(255,255,255,0.4)";
      default: return "rgba(255,255,255,0.5)";
    }
  };

  // Summary stats
  const totalDeposits = transactions.filter(t => t.type === "deposit").reduce((sum, t) => sum + t.usdValue, 0);
  const totalWithdrawals = transactions.filter(t => t.type === "withdrawal").reduce((sum, t) => sum + t.usdValue, 0);
  const totalBotProfits = transactions.filter(t => t.type === "bot_profit").reduce((sum, t) => sum + t.usdValue, 0);
  const totalAutoSweep = transactions.filter(t => t.type === "auto_sweep").reduce((sum, t) => sum + t.usdValue, 0);
  const totalFees = transactions.filter(t => t.type === "fee").reduce((sum, t) => sum + t.fee, 0);

  return (
    <LunaLayout title="TRANSACTION LEDGER" subtitle="V2.0 · Complete history of all wallet transactions and movements">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <NeonCard accent="cyan" padding={14}>
            <div style={labelStyle}>Total Deposits</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 18, fontWeight: 700, color: "#00F5FF" }}>
              ${totalDeposits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </div>
          </NeonCard>
          <NeonCard accent="green" padding={14}>
            <div style={labelStyle}>Bot Profits</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 18, fontWeight: 700, color: "#00FF88" }}>
              ${totalBotProfits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </div>
          </NeonCard>
          <NeonCard accent="magenta" padding={14}>
            <div style={labelStyle}>Auto-Swept</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 18, fontWeight: 700, color: "#FF006E" }}>
              ${totalAutoSweep.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </div>
          </NeonCard>
          <NeonCard accent="amber" padding={14}>
            <div style={labelStyle}>Total Fees</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 18, fontWeight: 700, color: "#FFB703" }}>
              ${totalFees.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </div>
          </NeonCard>
        </div>

        {/* Filters */}
        <NeonCard accent="violet" padding={16}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={labelStyle}>Search</label>
              <input
                type="text"
                placeholder="Search by description or asset..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", background: "rgba(155,93,229,0.04)",
                  border: "1px solid rgba(155,93,229,0.18)", borderRadius: 5,
                  padding: "7px 10px", color: "rgba(255,255,255,0.85)",
                  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ minWidth: 150 }}>
              <label style={labelStyle}>Type</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{
                  width: "100%", background: "rgba(155,93,229,0.04)",
                  border: "1px solid rgba(155,93,229,0.18)", borderRadius: 5,
                  padding: "7px 10px", color: "rgba(255,255,255,0.85)",
                  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11,
                  outline: "none", boxSizing: "border-box",
                }}
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="transfer">Transfers</option>
                <option value="bot_profit">Bot Profits</option>
                <option value="auto_sweep">Auto-Sweep</option>
                <option value="fee">Fees</option>
              </select>
            </div>
            <div style={{ minWidth: 150 }}>
              <label style={labelStyle}>Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  width: "100%", background: "rgba(155,93,229,0.04)",
                  border: "1px solid rgba(155,93,229,0.18)", borderRadius: 5,
                  padding: "7px 10px", color: "rgba(255,255,255,0.85)",
                  fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11,
                  outline: "none", boxSizing: "border-box",
                }}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </NeonCard>

        {/* Transaction Table */}
        <NeonCard accent="cyan" padding={16}>
          <SectionHeader title="TRANSACTION HISTORY" subtitle={`${filteredTransactions.length} transactions`} accent="cyan" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,245,255,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>Date & Time</th>
                  <th style={{ textAlign: "left", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>From</th>
                  <th style={{ textAlign: "left", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>To</th>
                  <th style={{ textAlign: "right", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>Amount</th>
                  <th style={{ textAlign: "right", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>USD Value</th>
                  <th style={{ textAlign: "right", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>Fee</th>
                  <th style={{ textAlign: "center", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "10px 6px", color: "rgba(255,255,255,0.5)" }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,245,255,0.01)" }}>
                    <td style={{ padding: "10px 6px", color: "rgba(255,255,255,0.6)", fontSize: 9 }}>
                      {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "10px 6px", color: getTxTypeColor(tx.type), fontWeight: 600 }}>
                      {getTxTypeIcon(tx.type)} {tx.type.replace("_", " ")}
                    </td>
                    <td style={{ padding: "10px 6px", color: "rgba(255,255,255,0.7)" }}>
                      {tx.fromAsset}
                    </td>
                    <td style={{ padding: "10px 6px", color: "rgba(255,255,255,0.7)" }}>
                      {tx.toAsset}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 6px", color: "rgba(255,255,255,0.8)" }}>
                      {tx.fromAmount.toFixed(4)}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 6px", color: "#00FF88", fontWeight: 600 }}>
                      ${tx.usdValue.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 6px", color: "#FF006E" }}>
                      {tx.fee > 0 ? `$${tx.fee.toFixed(2)}` : "—"}
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 6px", color: getTxStatusColor(tx.status) }}>
                      {tx.status === "completed" ? "✓" : tx.status === "pending" ? "⏳" : "✗"}
                    </td>
                    <td style={{ padding: "10px 6px", color: "rgba(255,255,255,0.6)", fontSize: 9 }}>
                      {tx.description}
                      {tx.notes && <div style={{ color: "rgba(255,255,255,0.4)", marginTop: 2 }}>({tx.notes})</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.4)" }}>
              No transactions match your filters.
            </div>
          )}
        </NeonCard>

        {/* Transaction Categories */}
        <NeonCard accent="green" padding={16}>
          <SectionHeader title="TRANSACTION BREAKDOWN" subtitle="By category" accent="green" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            {[
              { label: "Deposits", count: transactions.filter(t => t.type === "deposit").length, color: "#00F5FF" },
              { label: "Withdrawals", count: transactions.filter(t => t.type === "withdrawal").length, color: "#FF006E" },
              { label: "Transfers", count: transactions.filter(t => t.type === "transfer").length, color: "#00FF88" },
              { label: "Bot Profits", count: transactions.filter(t => t.type === "bot_profit").length, color: "#9B5DE5" },
              { label: "Auto-Sweeps", count: transactions.filter(t => t.type === "auto_sweep").length, color: "#FFB703" },
              { label: "Fees", count: transactions.filter(t => t.type === "fee").length, color: "#FF6B6B" },
            ].map(cat => (
              <div key={cat.label} style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${cat.color}33`, borderRadius: 6, padding: 12 }}>
                <div style={{ color: cat.color, fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  {cat.label}
                </div>
                <div style={{ color: cat.color, fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 18, fontWeight: 700 }}>
                  {cat.count}
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

      </div>
    </LunaLayout>
  );
}
