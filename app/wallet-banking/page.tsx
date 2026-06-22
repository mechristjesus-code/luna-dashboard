"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { SEED_WALLET_ACCOUNTS, SEED_TRANSACTIONS, WalletAccount, Transaction, generatePortfolioSnapshot } from "@/lib/luna/data";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

export default function WalletBankingPage() {
  const [accounts, setAccounts] = useState<WalletAccount[]>(SEED_WALLET_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(accounts[0]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const [transferForm, setTransferForm] = useState({
    fromAccount: accounts[0]?.id || "",
    toAccount: "",
    asset: "USDT",
    amount: "",
  });

  const [depositForm, setDepositForm] = useState({
    account: accounts[0]?.id || "",
    asset: "USDT",
    amount: "",
    network: "Ethereum",
  });

  const [withdrawalForm, setWithdrawalForm] = useState({
    account: accounts[0]?.id || "",
    asset: "USDT",
    amount: "",
    address: "",
  });

  const portfolio = generatePortfolioSnapshot();
  const totalPortfolioValue = portfolio.totalUsdValue;

  const handleTransfer = () => {
    if (!transferForm.fromAccount || !transferForm.toAccount || !transferForm.amount) {
      alert("Please fill all fields");
      return;
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: transferForm.fromAccount,
      type: "transfer",
      status: "completed",
      fromAsset: transferForm.asset,
      toAsset: transferForm.asset,
      fromAmount: parseFloat(transferForm.amount),
      toAmount: parseFloat(transferForm.amount),
      usdValue: parseFloat(transferForm.amount) * 1.0, // simplified
      fee: 0,
      relatedAccountId: transferForm.toAccount,
      description: `Transfer ${transferForm.amount} ${transferForm.asset}`,
      timestamp: new Date(),
      completedAt: new Date(),
    };

    setTransactions([newTx, ...transactions]);
    setShowTransferModal(false);
    setTransferForm({ fromAccount: accounts[0]?.id || "", toAccount: "", asset: "USDT", amount: "" });
    alert("Transfer completed successfully!");
  };

  const handleDeposit = () => {
    if (!depositForm.account || !depositForm.amount) {
      alert("Please fill all fields");
      return;
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: depositForm.account,
      type: "deposit",
      status: "completed",
      fromAsset: depositForm.asset,
      toAsset: depositForm.asset,
      fromAmount: parseFloat(depositForm.amount),
      toAmount: parseFloat(depositForm.amount),
      usdValue: parseFloat(depositForm.amount) * 1.0,
      fee: 0,
      description: `Deposit ${depositForm.amount} ${depositForm.asset}`,
      timestamp: new Date(),
      completedAt: new Date(),
    };

    setTransactions([newTx, ...transactions]);
    setShowDepositModal(false);
    setDepositForm({ account: accounts[0]?.id || "", asset: "USDT", amount: "", network: "Ethereum" });
    alert("Deposit recorded successfully!");
  };

  const handleWithdrawal = () => {
    if (!withdrawalForm.account || !withdrawalForm.amount || !withdrawalForm.address) {
      alert("Please fill all fields");
      return;
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: withdrawalForm.account,
      type: "withdrawal",
      status: "pending",
      fromAsset: withdrawalForm.asset,
      toAsset: withdrawalForm.asset,
      fromAmount: parseFloat(withdrawalForm.amount),
      toAmount: parseFloat(withdrawalForm.amount),
      usdValue: parseFloat(withdrawalForm.amount) * 1.0,
      fee: 5,
      description: `Withdrawal ${withdrawalForm.amount} ${withdrawalForm.asset}`,
      timestamp: new Date(),
      notes: "Pending blockchain confirmation",
    };

    setTransactions([newTx, ...transactions]);
    setShowWithdrawalModal(false);
    setWithdrawalForm({ account: accounts[0]?.id || "", asset: "USDT", amount: "", address: "" });
    alert("Withdrawal initiated! Pending blockchain confirmation.");
  };

  return (
    <LunaLayout title="WALLET & BANKING" subtitle="V2.0 · Manage crypto holdings, transfers, deposits, and savings accounts">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Portfolio Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <NeonCard accent="cyan" padding={16}>
            <div style={labelStyle}>Total Portfolio Value</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#00F5FF", marginBottom: 4 }}>
              ${totalPortfolioValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </div>
            <div style={{ ...monoSm }}>↑ ${portfolio.dayChange.toFixed(2)} ({portfolio.dayChangePercent.toFixed(2)}%) today</div>
          </NeonCard>
          <NeonCard accent="green" padding={16}>
            <div style={labelStyle}>Active Accounts</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#00FF88", marginBottom: 4 }}>
              {accounts.length}
            </div>
            <div style={{ ...monoSm }}>Trading, Savings, Emergency</div>
          </NeonCard>
          <NeonCard accent="magenta" padding={16}>
            <div style={labelStyle}>Total Transactions</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#FF006E", marginBottom: 4 }}>
              {transactions.length}
            </div>
            <div style={{ ...monoSm }}>Deposits, Transfers, Profits</div>
          </NeonCard>
          <NeonCard accent="amber" padding={16}>
            <div style={labelStyle}>Pending Transactions</div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 24, fontWeight: 700, color: "#FFB703", marginBottom: 4 }}>
              {transactions.filter(t => t.status === "pending").length}
            </div>
            <div style={{ ...monoSm }}>Awaiting confirmation</div>
          </NeonCard>
        </div>

        {/* Accounts & Holdings */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Account List */}
          <NeonCard accent="cyan" padding={16}>
            <SectionHeader title="ACCOUNTS" subtitle="Your wallet accounts" accent="cyan" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc)}
                  style={{
                    padding: "12px", borderRadius: 6, cursor: "pointer",
                    background: selectedAccount?.id === acc.id ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.02)",
                    border: selectedAccount?.id === acc.id ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 600, color: "#00F5FF" }}>
                      {acc.name}
                    </span>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "#00FF88" }}>
                      ${acc.totalUsdValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ ...monoSm }}>
                    {acc.assets.length} assets • {acc.accountType}
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>

          {/* Asset Distribution */}
          <NeonCard accent="green" padding={16}>
            <SectionHeader title="ASSET DISTRIBUTION" subtitle="By value" accent="green" />
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={portfolio.byAsset} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="usdValue">
                  {portfolio.byAsset.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#00F5FF", "#00FF88", "#9B5DE5", "#FFB703"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0D1526", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
              {portfolio.byAsset.map((asset, idx) => (
                <div key={asset.symbol} style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                  <span style={{ color: ["#00F5FF", "#00FF88", "#9B5DE5", "#FFB703"][idx % 4] }}>● {asset.symbol}</span>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>${asset.usdValue.toFixed(2)} ({asset.percentage.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>

        {/* Selected Account Details */}
        {selectedAccount && (
          <NeonCard accent="violet" padding={16}>
            <SectionHeader title={selectedAccount.name.toUpperCase()} subtitle={selectedAccount.description} accent="violet" />
            
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <button style={btnStyle("#00F5FF", "rgba(0,245,255,0.1)", "rgba(0,245,255,0.4)")} onClick={() => setShowDepositModal(true)}>
                + DEPOSIT
              </button>
              <button style={btnStyle("#00FF88", "rgba(0,255,136,0.1)", "rgba(0,255,136,0.4)")} onClick={() => setShowTransferModal(true)}>
                ↔ TRANSFER
              </button>
              <button style={btnStyle("#FF006E", "rgba(255,0,110,0.1)", "rgba(255,0,110,0.4)")} onClick={() => setShowWithdrawalModal(true)}>
                - WITHDRAW
              </button>
            </div>

            {/* Assets Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(155,93,229,0.2)" }}>
                    <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Asset</th>
                    <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Balance</th>
                    <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Price</th>
                    <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>USD Value</th>
                    <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAccount.assets.map((asset) => (
                    <tr key={asset.symbol} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(155,93,229,0.02)" }}>
                      <td style={{ padding: "8px 4px", color: "#9B5DE5", fontWeight: 600 }}>{asset.symbol}</td>
                      <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{asset.balance.toFixed(4)}</td>
                      <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>${asset.priceUsd.toLocaleString()}</td>
                      <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88" }}>${asset.usdValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: "right", padding: "8px 4px", color: asset.change24h > 0 ? "#00FF88" : "#FF006E" }}>
                        {asset.change24h > 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NeonCard>
        )}

        {/* Recent Transactions */}
        <NeonCard accent="amber" padding={16}>
          <SectionHeader title="RECENT TRANSACTIONS" subtitle="Last 10 transactions" accent="amber" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,183,3,0.2)" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Asset</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Amount</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>USD Value</th>
                  <th style={{ textAlign: "center", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Description</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,183,3,0.02)" }}>
                    <td style={{ padding: "8px 4px", color: "#FFB703", fontWeight: 600 }}>{tx.type}</td>
                    <td style={{ padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{tx.fromAsset}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.7)" }}>{tx.fromAmount.toFixed(4)}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "#00FF88" }}>${tx.usdValue.toFixed(2)}</td>
                    <td style={{ textAlign: "center", padding: "8px 4px", color: tx.status === "completed" ? "#00FF88" : "#FFB703" }}>
                      {tx.status === "completed" ? "✓" : "⏳"}
                    </td>
                    <td style={{ padding: "8px 4px", color: "rgba(255,255,255,0.6)", fontSize: 9 }}>{tx.description}</td>
                    <td style={{ textAlign: "right", padding: "8px 4px", color: "rgba(255,255,255,0.5)", fontSize: 9 }}>
                      {tx.timestamp.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeonCard>

      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <NeonCard accent="green" padding={24} style={{ maxWidth: 500 }}>
            <SectionHeader title="TRANSFER FUNDS" subtitle="Move funds between accounts" accent="green" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>From Account</label>
                <select style={inputStyle} value={transferForm.fromAccount} onChange={e => setTransferForm({...transferForm, fromAccount: e.target.value})}>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>To Account</label>
                <select style={inputStyle} value={transferForm.toAccount} onChange={e => setTransferForm({...transferForm, toAccount: e.target.value})}>
                  <option value="">Select account</option>
                  {accounts.filter(acc => acc.id !== transferForm.fromAccount).map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Asset</label>
                <select style={inputStyle} value={transferForm.asset} onChange={e => setTransferForm({...transferForm, asset: e.target.value})}>
                  <option>USDT</option>
                  <option>BTC</option>
                  <option>ETH</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Amount</label>
                <input style={inputStyle} type="number" value={transferForm.amount} onChange={e => setTransferForm({...transferForm, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnStyle("#00FF88", "rgba(0,255,136,0.1)", "rgba(0,255,136,0.4)")} onClick={handleTransfer} style={{ flex: 1 }}>
                  CONFIRM TRANSFER
                </button>
                <button style={btnStyle("#FF006E", "rgba(255,0,110,0.1)", "rgba(255,0,110,0.4)")} onClick={() => setShowTransferModal(false)} style={{ flex: 1 }}>
                  CANCEL
                </button>
              </div>
            </div>
          </NeonCard>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <NeonCard accent="cyan" padding={24} style={{ maxWidth: 500 }}>
            <SectionHeader title="DEPOSIT FUNDS" subtitle="Add funds to your account" accent="cyan" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Account</label>
                <select style={inputStyle} value={depositForm.account} onChange={e => setDepositForm({...depositForm, account: e.target.value})}>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Asset</label>
                <select style={inputStyle} value={depositForm.asset} onChange={e => setDepositForm({...depositForm, asset: e.target.value})}>
                  <option>USDT</option>
                  <option>BTC</option>
                  <option>ETH</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Network</label>
                <select style={inputStyle} value={depositForm.network} onChange={e => setDepositForm({...depositForm, network: e.target.value})}>
                  <option>Ethereum</option>
                  <option>Bitcoin</option>
                  <option>Solana</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Amount</label>
                <input style={inputStyle} type="number" value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, padding: 10 }}>
                <div style={{ ...labelStyle, marginBottom: 6 }}>Deposit Address</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#00F5FF", wordBreak: "break-all" }}>
                  0x1234567890abcdef1234567890abcdef12345678
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnStyle("#00F5FF", "rgba(0,245,255,0.1)", "rgba(0,245,255,0.4)")} onClick={handleDeposit} style={{ flex: 1 }}>
                  RECORD DEPOSIT
                </button>
                <button style={btnStyle("#FF006E", "rgba(255,0,110,0.1)", "rgba(255,0,110,0.4)")} onClick={() => setShowDepositModal(false)} style={{ flex: 1 }}>
                  CANCEL
                </button>
              </div>
            </div>
          </NeonCard>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <NeonCard accent="magenta" padding={24} style={{ maxWidth: 500 }}>
            <SectionHeader title="WITHDRAW FUNDS" subtitle="Send funds to external wallet" accent="magenta" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>From Account</label>
                <select style={inputStyle} value={withdrawalForm.account} onChange={e => setWithdrawalForm({...withdrawalForm, account: e.target.value})}>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Asset</label>
                <select style={inputStyle} value={withdrawalForm.asset} onChange={e => setWithdrawalForm({...withdrawalForm, asset: e.target.value})}>
                  <option>USDT</option>
                  <option>BTC</option>
                  <option>ETH</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Amount</label>
                <input style={inputStyle} type="number" value={withdrawalForm.amount} onChange={e => setWithdrawalForm({...withdrawalForm, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>Recipient Address</label>
                <input style={inputStyle} type="text" value={withdrawalForm.address} onChange={e => setWithdrawalForm({...withdrawalForm, address: e.target.value})} placeholder="0x..." />
              </div>
              <div style={{ background: "rgba(255,0,110,0.05)", border: "1px solid rgba(255,0,110,0.2)", borderRadius: 6, padding: 10 }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#FF006E" }}>
                  ⚠ Network fee: ~$5.00 | Estimated time: 5-30 minutes
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnStyle("#FF006E", "rgba(255,0,110,0.1)", "rgba(255,0,110,0.4)")} onClick={handleWithdrawal} style={{ flex: 1 }}>
                  CONFIRM WITHDRAWAL
                </button>
                <button style={btnStyle("#00F5FF", "rgba(0,245,255,0.1)", "rgba(0,245,255,0.4)")} onClick={() => setShowWithdrawalModal(false)} style={{ flex: 1 }}>
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
