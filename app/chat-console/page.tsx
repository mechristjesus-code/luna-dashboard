"use client";

import { useState, useRef, useEffect } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, SectionHeader } from "@/components/luna/NeonCard";
import { PulseIndicator, StatusBadge } from "@/components/luna/PulseIndicator";

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "luna";
  content: string;
  layer: string;
  timestamp: Date;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLORS = {
  bg: "#050810",
  panel: "#0D1526",
  panelDeep: "#07101E",
  cyan: "#00F5FF",
  violet: "#9B5DE5",
  magenta: "#FF006E",
  green: "#00FF88",
  amber: "#FFB700",
  textDim: "#5A6A8A",
  textMid: "#8899BB",
};

const LAYER_BUTTONS = ["AUTO", "V1-V3 COGNITION", "V4-V6 AGENT", "V7-V9 ECONOMY", "V10-V12 ECOSYSTEM", "CRYPTO BOT"];

const QUICK_COMMANDS = [
  "What are the active signals?",
  "Show bot performance",
  "Generate company blueprint",
  "Run strategy backtest",
  "Check system health",
  "Expand ecosystem",
];

const LAYER_STATUS = [
  { name: "V1:COGNITION", status: "online" },
  { name: "V2:SIGNAL", status: "online" },
  { name: "V3:MEMORY", status: "processing" },
  { name: "V4:STRATEGY", status: "online" },
  { name: "V5:AGENT", status: "online" },
  { name: "V6:EXECUTOR", status: "idle" },
  { name: "V7:ECONOMY", status: "online" },
  { name: "V8:REVENUE", status: "processing" },
  { name: "V9:DEPLOY", status: "online" },
  { name: "V10:NETWORK", status: "online" },
  { name: "V11:PARTNER", status: "idle" },
  { name: "V12:ECOSYSTEM", status: "online" },
];

// ── Initial messages ──────────────────────────────────────────────────────────

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    role: "luna",
    content: "LUNA Command Interface initialized. All 12 architecture layers online. How can I assist you today, Operator?",
    layer: "[SYSTEM]",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "2",
    role: "user",
    content: "What is the current system status?",
    layer: "",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "3",
    role: "luna",
    content:
      "System Status Report:\n• All 12 layers operational\n• 4 trading bots active (3 simulation, 1 live)\n• 6 crypto signals triggered in last hour\n• Simulated MRR: $127,840\n• System health: 94%\n\nRecommendation: Monitor BTC/USDT RSI — currently at 28.4, approaching oversold territory.",
    layer: "[V1:COGNITION]",
    timestamp: new Date(Date.now() - 55000),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

// ── Response generator ────────────────────────────────────────────────────────

function generateLunaResponse(msg: string): { layer: string; content: string } {
  const m = msg.toLowerCase();
  if (m.match(/signal|rsi|crypto/)) {
    return {
      layer: "[V2:COGNITION]",
      content:
        "Crypto Signal Analysis:\n• BTC/USDT RSI: 28.4 → Oversold zone, potential reversal\n• ETH volume spike: +340% in last 2h\n• SOL/USDT MACD crossover detected (bullish)\n• DOGE sentiment score: 0.72 (positive)\n\nRecommended action: Monitor BTC/USDT for long entry above $42,500.",
    };
  }
  if (m.match(/bot|trade|execute/)) {
    return {
      layer: "[V5:AGENT]",
      content:
        "Trading Bot Status:\n• Bot-Alpha (BTC scalp): ACTIVE — +2.4% today\n• Bot-Beta (ETH swing): ACTIVE — +1.1% today\n• Bot-Gamma (SOL momentum): SIM — running backtest\n• Bot-Delta (multi-asset): SIM — paper trading\n\nTotal simulated P&L today: +$3,247. Live bot P&L: +$1,820.",
    };
  }
  if (m.match(/revenue|mrr|company|saas/)) {
    return {
      layer: "[V7:ECONOMY]",
      content:
        "Economy Metrics:\n• Simulated MRR: $127,840 (+12.3% MoM)\n• ARR Projection: $1.53M\n• Active subscriptions: 847\n• Churn rate: 2.1%\n• LTV/CAC ratio: 4.8x\n\nNext milestone: $150K MRR. ETA at current growth: 47 days.",
    };
  }
  if (m.match(/deploy|api|service/)) {
    return {
      layer: "[V9:ECONOMY]",
      content:
        "Deployment Status:\n• API Gateway: ONLINE (99.97% uptime)\n• 14 microservices running\n• 3 services pending update (non-critical)\n• Database clusters: 4 healthy\n• CDN latency: 18ms avg\n\nNo deployment actions required. All SLAs met.",
    };
  }
  if (m.match(/strategy|backtest/)) {
    return {
      layer: "[V4:AGENT]",
      content:
        "Strategy Backtest Results (90-day):\n• Mean Reversion BTC: Sharpe 2.14, +34.7%\n• Momentum ETH: Sharpe 1.87, +28.3%\n• Breakout SOL: Sharpe 1.62, +41.2%\n• Grid BTC/USDT: Sharpe 3.01, +19.8%\n\nTop performer: Grid strategy. Recommend allocating 40% capital to BTC grid.",
    };
  }
  if (m.match(/ecosystem|expand/)) {
    return {
      layer: "[V12:ECOSYSTEM]",
      content:
        "Ecosystem Graph Status:\n• 23 active integrations\n• 7 partner nodes connected\n• Data flows: 1,240 events/min\n• New expansion opportunity: DeFi protocol integration (est. +$8K MRR)\n• Ecosystem health score: 91/100\n\nRecommend activating V11:PARTNER for new node onboarding.",
    };
  }
  return {
    layer: "[V1:COGNITION]",
    content:
      "Processing your request through cognitive analysis...\n\nBased on current operational patterns, system confidence is at 94%. All primary objectives are within expected parameters. Cross-referencing with historical data suggests optimal resource allocation is maintaining current trajectory.\n\nIs there a specific domain you'd like me to analyze further?",
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChatConsolePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("AUTO");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage() {
    const text = input.trim();
    if (!text || isTyping) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      layer: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const { layer, content } = generateLunaResponse(text);
      const lunaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "luna",
        content,
        layer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, lunaMsg]);
      setIsTyping(false);
    }, 1200);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  const statusColor = (s: string) =>
    s === "online" ? COLORS.green : s === "processing" ? COLORS.amber : COLORS.textDim;

  return (
    <LunaLayout title="LUNA CHAT CONSOLE" subtitle="Natural language command interface · All 12 layers">
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── Main chat column ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Message list */}
          <div
            style={{
              background: COLORS.panelDeep,
              border: `1px solid ${COLORS.cyan}22`,
              borderRadius: 12,
              padding: "16px 20px",
              maxHeight: "calc(100vh - 260px)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    background: msg.role === "user" ? "#0A1830" : "#08101F",
                    borderLeft: msg.role === "user" ? `3px solid ${COLORS.cyan}` : `3px solid ${COLORS.violet}`,
                    borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                    padding: "10px 14px",
                    position: "relative",
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {msg.role === "luna" && (
                      <span style={{ color: COLORS.violet, fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 13 }}>
                        LUNA ✦
                      </span>
                    )}
                    {msg.layer && (
                      <span
                        style={{
                          color: msg.role === "luna" ? COLORS.violet : COLORS.cyan,
                          fontFamily: "var(--font-jetbrains-mono, monospace)",
                          fontSize: 11,
                          opacity: 0.85,
                        }}
                      >
                        {msg.layer}
                      </span>
                    )}
                    <span
                      style={{
                        marginLeft: "auto",
                        color: COLORS.textDim,
                        fontFamily: "var(--font-jetbrains-mono, monospace)",
                        fontSize: 10,
                      }}
                    >
                      {fmt(msg.timestamp)}
                    </span>
                  </div>
                  {/* Body */}
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "var(--font-jetbrains-mono, monospace)",
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: msg.role === "user" ? "#C8DFFF" : "#A8C0E8",
                    }}
                  >
                    {msg.content}
                  </pre>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    background: "#08101F",
                    borderLeft: `3px solid ${COLORS.violet}`,
                    borderRadius: "4px 12px 12px 12px",
                    padding: "10px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: COLORS.violet, fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 13 }}>
                    LUNA ✦
                  </span>
                  <span
                    style={{
                      color: COLORS.textMid,
                      fontFamily: "var(--font-jetbrains-mono, monospace)",
                      fontSize: 13,
                      letterSpacing: 2,
                      animation: "pulse 1s infinite",
                    }}
                  >
                    TYPING...
                  </span>
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Layer selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LAYER_BUTTONS.map((lb) => (
              <button
                key={lb}
                onClick={() => setSelectedLayer(lb)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: `1px solid ${selectedLayer === lb ? COLORS.cyan : COLORS.textDim + "55"}`,
                  background: selectedLayer === lb ? COLORS.cyan + "18" : "transparent",
                  color: selectedLayer === lb ? COLORS.cyan : COLORS.textMid,
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  fontSize: 11,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {lb}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Enter command or question..."
              style={{
                flex: 1,
                background: "#0A1830",
                border: `1px solid ${COLORS.cyan}55`,
                borderRadius: 8,
                padding: "12px 16px",
                color: "#C8DFFF",
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              style={{
                padding: "12px 24px",
                background: isTyping || !input.trim() ? COLORS.cyan + "33" : COLORS.cyan,
                border: "none",
                borderRadius: 8,
                color: isTyping || !input.trim() ? COLORS.cyan + "88" : COLORS.bg,
                fontFamily: "var(--font-inter-tight, sans-serif)",
                fontWeight: 700,
                fontSize: 13,
                cursor: isTyping || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: 1,
              }}
            >
              SEND
            </button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick commands */}
          <NeonCard>
            <SectionHeader title="QUICK COMMANDS" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => setInput(cmd)}
                  style={{
                    textAlign: "left",
                    background: "#0A1830",
                    border: `1px solid ${COLORS.cyan}33`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: COLORS.textMid,
                    fontFamily: "var(--font-jetbrains-mono, monospace)",
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = COLORS.cyan + "99";
                    (e.currentTarget as HTMLButtonElement).style.color = COLORS.cyan;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = COLORS.cyan + "33";
                    (e.currentTarget as HTMLButtonElement).style.color = COLORS.textMid;
                  }}
                >
                  ▶ {cmd}
                </button>
              ))}
            </div>
          </NeonCard>

          {/* Layer status */}
          <NeonCard>
            <SectionHeader title="LAYER STATUS" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
              {LAYER_STATUS.map((l) => (
                <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: statusColor(l.status),
                      boxShadow: `0 0 6px ${statusColor(l.status)}`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono, monospace)",
                      fontSize: 11,
                      color: COLORS.textMid,
                      flex: 1,
                    }}
                  >
                    {l.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono, monospace)",
                      fontSize: 10,
                      color: statusColor(l.status),
                      textTransform: "uppercase",
                    }}
                  >
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>
      </div>
    </LunaLayout>
  );
}
