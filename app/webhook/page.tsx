"use client";
import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";

const C = {
  bg: "#050810", panel: "#0D1526",
  cyan: "#00F5FF", violet: "#9B5DE5", magenta: "#FF006E", green: "#00FF88", amber: "#FFB700",
  muted: "rgba(255,255,255,0.38)",
  mono: "var(--font-jetbrains-mono, monospace)", head: "var(--font-inter-tight, sans-serif)",
};

const EXAMPLE_PAYLOAD = `{
  "ticker": "BTCUSDT",
  "action": "buy",
  "indicator": "RSI",
  "value": 28.4,
  "threshold": 30,
  "confidence": 91,
  "sentiment": "bullish",
  "source": "TradingView",
  "secret": "your-webhook-secret"
}`;

const TRADINGVIEW_SCRIPT = `// TradingView Pine Script Alert Message
// Paste this in the "Message" field of your TradingView alert:
{
  "ticker": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{close}},
  "indicator": "RSI",
  "value": {{plot_0}},
  "threshold": 30,
  "confidence": 85,
  "sentiment": "{{strategy.order.action == 'buy' ? 'bullish' : 'bearish'}}",
  "source": "TradingView"
}`;

interface WebhookLog {
  id: string;
  ticker: string;
  action: string;
  indicator: string;
  confidence: number;
  sentiment: string;
  receivedAt: Date;
  status: "processed" | "error" | "pending";
}

const SEED_LOGS: WebhookLog[] = [
  { id: "wh1", ticker: "BTCUSDT", action: "buy", indicator: "RSI", confidence: 91, sentiment: "bullish", receivedAt: new Date(Date.now() - 120000), status: "processed" },
  { id: "wh2", ticker: "ETHUSDT", action: "sell", indicator: "MACD", confidence: 74, sentiment: "bearish", receivedAt: new Date(Date.now() - 480000), status: "processed" },
  { id: "wh3", ticker: "SOLUSDT", action: "buy", indicator: "volume_spike", confidence: 82, sentiment: "bullish", receivedAt: new Date(Date.now() - 900000), status: "processed" },
];

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function WebhookPage() {
  const [logs, setLogs] = useState<WebhookLog[]>(SEED_LOGS);
  const [secret, setSecret] = useState("luna-webhook-secret-2024");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"setup" | "logs" | "tradingview">("setup");

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/luna/webhook` : "/api/luna/webhook";

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/luna/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-TradingView-Secret": secret },
        body: JSON.stringify({
          ticker: "BTCUSDT",
          action: "buy",
          indicator: "RSI",
          value: 28.4,
          threshold: 30,
          confidence: 91,
          sentiment: "bullish",
          source: "Test",
          secret,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `Signal injected: ${data.signal?.coinPair} ${data.signal?.indicator} @ ${data.signal?.value}` });
        setLogs(prev => [{
          id: `wh${Date.now()}`,
          ticker: "BTCUSDT",
          action: "buy",
          indicator: "RSI",
          confidence: 91,
          sentiment: "bullish",
          receivedAt: new Date(),
          status: "processed",
        }, ...prev]);
      } else {
        setTestResult({ success: false, message: data.error ?? "Unknown error" });
      }
    } catch (e) {
      setTestResult({ success: false, message: `Network error: ${e}` });
    } finally {
      setTesting(false);
    }
  };

  const inp: React.CSSProperties = { width: "100%", background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.18)", borderRadius: 5, padding: "8px 12px", color: "rgba(255,255,255,0.85)", fontFamily: C.mono, fontSize: 11, outline: "none", boxSizing: "border-box" };
  const code: React.CSSProperties = { background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 6, padding: 16, fontFamily: C.mono, fontSize: 11, color: "rgba(255,255,255,0.75)", whiteSpace: "pre", overflowX: "auto", lineHeight: 1.7 };
  const tab = (t: typeof activeTab): React.CSSProperties => ({
    fontFamily: C.mono, fontSize: 10, padding: "6px 14px", borderRadius: 4, cursor: "pointer", letterSpacing: "0.1em",
    background: activeTab === t ? "rgba(0,245,255,0.1)" : "transparent",
    border: `1px solid ${activeTab === t ? "rgba(0,245,255,0.35)" : "rgba(255,255,255,0.1)"}`,
    color: activeTab === t ? C.cyan : "rgba(255,255,255,0.45)",
  });

  return (
    <LunaLayout title="WEBHOOK SIGNALS" subtitle="V1 · TradingView & external signal ingestion endpoint">
      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Webhooks Received" value={logs.length} sub="total signals" accent="cyan" icon="◉" />
        <MetricTile label="Processed" value={logs.filter(l => l.status === "processed").length} sub="successfully" accent="green" icon="✓" />
        <MetricTile label="Bullish Signals" value={logs.filter(l => l.sentiment === "bullish").length} sub="received" accent="amber" icon="▲" />
        <MetricTile label="Endpoint Status" value="ACTIVE" sub="ready to receive" accent="green" icon="⚡" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={tab("setup")} onClick={() => setActiveTab("setup")}>SETUP</button>
        <button style={tab("tradingview")} onClick={() => setActiveTab("tradingview")}>TRADINGVIEW</button>
        <button style={tab("logs")} onClick={() => setActiveTab("logs")}>SIGNAL LOGS</button>
      </div>

      {activeTab === "setup" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <SectionHeader title="ENDPOINT CONFIGURATION" subtitle="Configure your webhook receiver" accent="cyan" />
            <NeonCard accent="cyan" padding={16} style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", display: "block", marginBottom: 4 }}>WEBHOOK URL</label>
                <div style={{ ...inp, display: "flex", alignItems: "center", gap: 8, cursor: "text" }}>
                  <span style={{ color: C.green, fontSize: 10 }}>POST</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{webhookUrl}</span>
                  <button onClick={() => navigator.clipboard?.writeText(webhookUrl)} style={{ fontFamily: C.mono, fontSize: 9, color: C.cyan, background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 3, padding: "2px 8px", cursor: "pointer" }}>COPY</button>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", display: "block", marginBottom: 4 }}>WEBHOOK SECRET</label>
                <input style={inp} value={secret} onChange={e => setSecret(e.target.value)} placeholder="Enter a secret to validate incoming webhooks" />
                <div style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Send as header: X-TradingView-Secret or in body as "secret"</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={handleTest} disabled={testing} style={{ fontFamily: C.mono, fontSize: 10, color: testing ? "rgba(0,245,255,0.4)" : C.cyan, background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 4, padding: "8px 16px", cursor: testing ? "not-allowed" : "pointer", letterSpacing: "0.1em" }}>
                  {testing ? "SENDING..." : "⚡ TEST WEBHOOK"}
                </button>
                {testResult && (
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: testResult.success ? C.green : C.magenta }}>
                    {testResult.success ? "✓" : "✗"} {testResult.message}
                  </span>
                )}
              </div>
            </NeonCard>

            <SectionHeader title="SUPPORTED HEADERS" subtitle="Authentication & metadata" accent="violet" />
            <NeonCard accent="violet" padding={14}>
              {[
                ["Content-Type", "application/json", "Required"],
                ["X-TradingView-Secret", "your-secret", "Optional auth"],
                ["X-Luna-Key", "luna-key-xxxx", "Optional API key"],
              ].map(([h, v, note]) => (
                <div key={h} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.violet, minWidth: 160 }}>{h}</span>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: "rgba(255,255,255,0.5)", flex: 1 }}>{v}</span>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{note}</span>
                </div>
              ))}
            </NeonCard>
          </div>

          <div>
            <SectionHeader title="PAYLOAD FORMAT" subtitle="Expected JSON body" accent="green" />
            <NeonCard accent="green" padding={14} style={{ marginBottom: 16 }}>
              <pre style={code}>{EXAMPLE_PAYLOAD}</pre>
            </NeonCard>

            <SectionHeader title="FIELD REFERENCE" subtitle="All supported fields" accent="amber" />
            <NeonCard accent="amber" padding={14}>
              {[
                ["ticker", "string", "Required", "e.g. BTCUSDT"],
                ["action", "buy|sell", "Optional", "Trade direction"],
                ["indicator", "string", "Optional", "RSI, MACD, etc."],
                ["value", "number", "Optional", "Indicator value"],
                ["threshold", "number", "Optional", "Signal threshold"],
                ["confidence", "0–100", "Optional", "Signal confidence %"],
                ["sentiment", "bullish|bearish|neutral", "Optional", "Market sentiment"],
                ["source", "string", "Optional", "Signal source"],
                ["secret", "string", "Optional", "Webhook secret"],
              ].map(([f, t, req, desc]) => (
                <div key={f} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.cyan, minWidth: 90 }}>{f}</span>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: C.amber, minWidth: 80 }}>{t}</span>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: req === "Required" ? C.magenta : "rgba(255,255,255,0.3)", minWidth: 55 }}>{req}</span>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{desc}</span>
                </div>
              ))}
            </NeonCard>
          </div>
        </div>
      )}

      {activeTab === "tradingview" && (
        <div>
          <SectionHeader title="TRADINGVIEW INTEGRATION" subtitle="Auto-send alerts from TradingView to LUNA" accent="cyan" />
          <NeonCard accent="cyan" padding={16} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 12 }}>
              <strong style={{ color: C.cyan }}>Step 1:</strong> In TradingView, create an alert on your indicator or strategy.<br />
              <strong style={{ color: C.cyan }}>Step 2:</strong> Set the webhook URL to: <span style={{ color: C.green }}>{webhookUrl}</span><br />
              <strong style={{ color: C.cyan }}>Step 3:</strong> Paste the Pine Script message template below in the "Message" field.<br />
              <strong style={{ color: C.cyan }}>Step 4:</strong> Enable "Webhook URL" in the notification settings.
            </div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.1em" }}>PINE SCRIPT ALERT MESSAGE TEMPLATE</div>
            <pre style={code}>{TRADINGVIEW_SCRIPT}</pre>
          </NeonCard>

          <NeonCard accent="violet" padding={16}>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              <strong style={{ color: C.violet }}>Supported Indicators:</strong> RSI, MACD, Bollinger Bands, Volume, Momentum, ATR, Stochastic, EMA Cross, SMA Cross, Supertrend, VWAP<br />
              <strong style={{ color: C.violet }}>Supported Timeframes:</strong> 1m, 5m, 15m, 1h, 4h, 1D, 1W<br />
              <strong style={{ color: C.violet }}>Supported Pairs:</strong> Any crypto pair available on TradingView<br />
              <strong style={{ color: C.violet }}>Rate Limit:</strong> 100 webhooks per minute per source
            </div>
          </NeonCard>
        </div>
      )}

      {activeTab === "logs" && (
        <div>
          <SectionHeader title="SIGNAL LOGS" subtitle={`${logs.length} webhooks received`} accent="amber"
            right={<button onClick={() => setLogs([])} style={{ fontFamily: C.mono, fontSize: 9, color: C.magenta, background: "rgba(255,0,110,0.08)", border: "1px solid rgba(255,0,110,0.2)", borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>CLEAR</button>}
          />
          <NeonCard accent="amber" padding={0} style={{ overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 100px 80px 80px 80px 80px 1fr", padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
              {["TIME", "TICKER", "ACTION", "INDICATOR", "CONFIDENCE", "SENTIMENT", "STATUS"].map(h => (
                <span key={h} style={{ fontFamily: C.mono, fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{h}</span>
              ))}
            </div>
            {logs.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", fontFamily: C.mono, fontSize: 11, color: C.muted }}>No webhooks received yet</div>
            ) : logs.map(log => (
              <div key={log.id} style={{ display: "grid", gridTemplateColumns: "80px 100px 80px 80px 80px 80px 1fr", padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{formatTime(log.receivedAt)}</span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.cyan }}>{log.ticker}</span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: log.action === "buy" ? C.green : C.magenta }}>{log.action.toUpperCase()}</span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{log.indicator}</span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: log.confidence >= 80 ? C.green : log.confidence >= 60 ? C.amber : C.magenta }}>{log.confidence}%</span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: log.sentiment === "bullish" ? C.green : log.sentiment === "bearish" ? C.magenta : "rgba(255,255,255,0.5)" }}>{log.sentiment}</span>
                <span style={{ fontFamily: C.mono, fontSize: 9, color: log.status === "processed" ? C.green : C.magenta, border: `1px solid ${log.status === "processed" ? C.green : C.magenta}44`, borderRadius: 3, padding: "1px 6px", display: "inline-block" }}>{log.status.toUpperCase()}</span>
              </div>
            ))}
          </NeonCard>
        </div>
      )}
    </LunaLayout>
  );
}
