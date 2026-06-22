"use client";

import { useState, useRef, useEffect } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, SectionHeader } from "@/components/luna/NeonCard";
import { PulseIndicator } from "@/components/luna/PulseIndicator";

const mono = "var(--font-jetbrains-mono, monospace)";
const head = "var(--font-inter-tight, sans-serif)";

interface TermLine { id: string; type: "input" | "output" | "error" | "info" | "success"; text: string; ts: Date; }

const WELCOME: TermLine[] = [
  { id: "w0", type: "info", text: "╔══════════════════════════════════════════════════╗", ts: new Date() },
  { id: "w1", type: "info", text: "║  LUNA ADMIN TERMINAL  v1.0  — Termux API Console  ║", ts: new Date() },
  { id: "w2", type: "info", text: "╚══════════════════════════════════════════════════╝", ts: new Date() },
  { id: "w3", type: "info", text: "Type  help  for commands.  Type  api  for API docs.", ts: new Date() },
  { id: "w4", type: "info", text: "Use  termux  prefix for phone-ready curl snippets.", ts: new Date() },
];

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:13000";
const ADMIN_KEY = "luna-admin-dev";

type CommandFn = (args: string[]) => Promise<TermLine[]>;

function mkLine(type: TermLine["type"], text: string): TermLine {
  return { id: `l${Date.now()}-${Math.random()}`, type, text, ts: new Date() };
}

function jsonBlock(obj: unknown): TermLine[] {
  return JSON.stringify(obj, null, 2).split("\n").map(l => mkLine("output", l));
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", "X-Luna-Key": ADMIN_KEY, ...(opts?.headers ?? {}) },
    ...opts,
  });
  return res.json();
}

export default function AdminTerminal() {
  const [lines, setLines] = useState<TermLine[]>(WELCOME);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [baseUrl, setBaseUrl] = useState(BASE_URL);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin);
  }, []);

  const push = (...newLines: TermLine[]) => setLines(p => [...p, ...newLines]);

  const COMMANDS: Record<string, CommandFn> = {
    help: async () => [
      mkLine("info", "── LUNA Terminal Commands ──────────────────────────"),
      mkLine("output", "  help              — Show this help"),
      mkLine("output", "  api               — Show all API endpoints"),
      mkLine("output", "  status            — System status"),
      mkLine("output", "  bots              — List all bots"),
      mkLine("output", "  bot create <json> — Create a bot (JSON inline)"),
      mkLine("output", "  bot stop <id>     — Stop a bot"),
      mkLine("output", "  bot live <id>     — Switch bot to live mode"),
      mkLine("output", "  signals           — List active signals"),
      mkLine("output", "  signal inject <pair> <indicator> <value>"),
      mkLine("output", "  portfolio         — Show portfolio"),
      mkLine("output", "  strategies        — List strategies"),
      mkLine("output", "  activity [limit]  — Activity log"),
      mkLine("output", "  chat <message>    — Send to LUNA chat"),
      mkLine("output", "  save <code>       — Save code snippet"),
      mkLine("output", "  snippets          — List saved snippets"),
      mkLine("output", "  termux            — Show Termux curl guide"),
      mkLine("output", "  clear             — Clear terminal"),
      mkLine("info",   "── Admin Commands (require key) ────────────────────"),
      mkLine("output", "  admin reset-bots  — Stop all bots"),
      mkLine("output", "  admin clear-signals"),
      mkLine("output", "  admin setting <key> <value>"),
    ],

    api: async () => [
      mkLine("info", `── LUNA REST API — Base: ${baseUrl} ────────────────`),
      mkLine("success", "  GET    /api/health"),
      mkLine("success", "  GET    /api/luna/system"),
      mkLine("success", "  GET    /api/luna/bots         ?mode=simulation&status=running"),
      mkLine("success", "  POST   /api/luna/bots         {name,coinPair,strategy,mode}"),
      mkLine("success", "  GET    /api/luna/bots/:id"),
      mkLine("success", "  PATCH  /api/luna/bots/:id     {status,mode,virtualBalance}"),
      mkLine("success", "  DELETE /api/luna/bots/:id"),
      mkLine("success", "  GET    /api/luna/signals      ?triggered=true&pair=BTC/USDT"),
      mkLine("success", "  POST   /api/luna/signals      {coinPair,indicator,value,triggered}"),
      mkLine("success", "  DELETE /api/luna/signals"),
      mkLine("success", "  GET    /api/luna/strategies"),
      mkLine("success", "  POST   /api/luna/strategies   {name,signalConditions,status}"),
      mkLine("success", "  PUT    /api/luna/strategies   {id,...fields}"),
      mkLine("success", "  DELETE /api/luna/strategies   ?id=st1"),
      mkLine("success", "  GET    /api/luna/portfolio"),
      mkLine("success", "  POST   /api/luna/portfolio    {symbol,balance,usdValue}"),
      mkLine("success", "  GET    /api/luna/activity     ?severity=critical&limit=20"),
      mkLine("success", "  POST   /api/luna/activity     {message,layer,severity}"),
      mkLine("success", "  POST   /api/luna/chat         {message}"),
      mkLine("success", "  GET    /api/admin             (X-Luna-Key required)"),
      mkLine("success", "  POST   /api/admin             {command,payload}"),
      mkLine("info",   "  Admin Key: X-Luna-Key: luna-admin-dev"),
    ],

    termux: async () => [
      mkLine("info", "── Termux Phone Setup Guide ─────────────────────────"),
      mkLine("output", "# Install on your phone (Termux):"),
      mkLine("output", "pkg install curl jq"),
      mkLine("output", ""),
      mkLine("output", `# Save your server URL:`),
      mkLine("output", `export LUNA="${baseUrl}"`),
      mkLine("output", `export LUNA_KEY="luna-admin-dev"`),
      mkLine("output", ""),
      mkLine("output", "# Check system status:"),
      mkLine("success", `curl -s "$LUNA/api/luna/system" | jq '.data.metrics'`),
      mkLine("output", ""),
      mkLine("output", "# List all running bots:"),
      mkLine("success", `curl -s "$LUNA/api/luna/bots?status=running" | jq '.data[].name'`),
      mkLine("output", ""),
      mkLine("output", "# Stop a bot (replace b1 with bot ID):"),
      mkLine("success", `curl -s -X PATCH "$LUNA/api/luna/bots/b1" \\`),
      mkLine("success", `  -H "Content-Type: application/json" \\`),
      mkLine("success", `  -d '{"status":"stopped"}' | jq`),
      mkLine("output", ""),
      mkLine("output", "# Create a new bot:"),
      mkLine("success", `curl -s -X POST "$LUNA/api/luna/bots" \\`),
      mkLine("success", `  -H "Content-Type: application/json" \\`),
      mkLine("success", `  -d '{"name":"PHONE-BOT","coinPair":"BTC/USDT","strategy":"RSI Reversal v2"}' | jq`),
      mkLine("output", ""),
      mkLine("output", "# Inject a signal:"),
      mkLine("success", `curl -s -X POST "$LUNA/api/luna/signals" \\`),
      mkLine("success", `  -H "Content-Type: application/json" \\`),
      mkLine("success", `  -d '{"coinPair":"BTC/USDT","indicator":"RSI","value":28,"triggered":true,"severity":"critical"}' | jq`),
      mkLine("output", ""),
      mkLine("output", "# Chat with LUNA:"),
      mkLine("success", `curl -s -X POST "$LUNA/api/luna/chat" \\`),
      mkLine("success", `  -H "Content-Type: application/json" \\`),
      mkLine("success", `  -d '{"message":"What are the active signals?"}' | jq '.lunaResponse.content'`),
      mkLine("output", ""),
      mkLine("output", "# Admin: reset all bots:"),
      mkLine("success", `curl -s -X POST "$LUNA/api/admin" \\`),
      mkLine("success", `  -H "X-Luna-Key: $LUNA_KEY" -H "Content-Type: application/json" \\`),
      mkLine("success", `  -d '{"command":"reset_bots"}' | jq`),
    ],

    status: async () => {
      const data = await apiFetch("/api/luna/system");
      return [mkLine("info", "── System Status ───────────────────────────────────"), ...jsonBlock(data?.data?.metrics ?? data)];
    },

    bots: async () => {
      const data = await apiFetch("/api/luna/bots");
      if (!data?.data) return [mkLine("error", "Failed to fetch bots")];
      return [
        mkLine("info", `── Bots (${data.count}) ─────────────────────────────────────`),
        ...data.data.map((b: { id: string; name: string; coinPair: string; mode: string; status: string; totalPnl: number }) =>
          mkLine(b.status === "running" ? "success" : "output",
            `  [${b.id}] ${b.name.padEnd(10)} ${b.coinPair.padEnd(10)} ${b.mode.padEnd(12)} ${b.status.padEnd(8)} PnL: $${b.totalPnl}`)
        ),
        mkLine("info", `  Total PnL: $${data.meta?.totalPnl ?? 0}`),
      ];
    },

    signals: async () => {
      const data = await apiFetch("/api/luna/signals?triggered=true&limit=10");
      if (!data?.data) return [mkLine("error", "Failed to fetch signals")];
      return [
        mkLine("info", `── Active Signals (${data.meta?.triggered ?? 0}) ─────────────────────────────`),
        ...data.data.map((s: { coinPair: string; indicator: string; value: number; severity: string }) =>
          mkLine(s.severity === "critical" ? "error" : s.severity === "warn" ? "info" : "output",
            `  ${s.coinPair.padEnd(12)} ${s.indicator.padEnd(14)} val:${s.value} [${s.severity.toUpperCase()}]`)
        ),
      ];
    },

    portfolio: async () => {
      const data = await apiFetch("/api/luna/portfolio");
      if (!data?.data) return [mkLine("error", "Failed")];
      return [
        mkLine("info", `── Portfolio  Total: $${data.meta?.totalUsd?.toLocaleString()} ─────────────`),
        ...data.data.map((a: { symbol: string; usdValue: number; allocation: number; change24h: number }) =>
          mkLine("output", `  ${a.symbol.padEnd(6)} $${String(a.usdValue.toLocaleString()).padEnd(10)} ${a.allocation.toFixed(1).padEnd(7)}%  24h: ${a.change24h >= 0 ? "+" : ""}${a.change24h}%`)
        ),
      ];
    },

    strategies: async () => {
      const data = await apiFetch("/api/luna/strategies");
      if (!data?.data) return [mkLine("error", "Failed")];
      return [
        mkLine("info", `── Strategies (${data.count}) ──────────────────────────────────`),
        ...data.data.map((s: { id: string; name: string; status: string; winRate: number; tradeCount: number }) =>
          mkLine(s.status === "active" ? "success" : "output",
            `  [${s.id}] ${s.name.padEnd(22)} ${s.status.padEnd(10)} WR:${s.winRate}% T:${s.tradeCount}`)
        ),
      ];
    },

    activity: async (args) => {
      const limit = args[0] ?? "15";
      const data = await apiFetch(`/api/luna/activity?limit=${limit}`);
      if (!data?.data) return [mkLine("error", "Failed")];
      return [
        mkLine("info", `── Activity Log (last ${limit}) ────────────────────────────`),
        ...data.data.map((e: { layer: string; severity: string; message: string }) =>
          mkLine(e.severity === "critical" ? "error" : e.severity === "warn" ? "info" : "output",
            `  [${e.layer}] ${e.message.slice(0, 70)}`)
        ),
      ];
    },

    chat: async (args) => {
      const message = args.join(" ");
      if (!message) return [mkLine("error", "Usage: chat <your message>")];
      const data = await apiFetch("/api/luna/chat", { method: "POST", body: JSON.stringify({ message }) });
      return [
        mkLine("info", `You: ${message}`),
        mkLine("success", `LUNA ${data?.lunaResponse?.layer ?? ""}: ${data?.lunaResponse?.content ?? "No response"}`),
      ];
    },

    save: async (args) => {
      const code = args.join(" ");
      if (!code) return [mkLine("error", "Usage: save <code snippet>")];
      const data = await apiFetch("/api/admin", { method: "POST", body: JSON.stringify({ command: "save_code", payload: { code } }) });
      return [mkLine("success", `✓ Snippet saved. Total: ${data?.total_snippets ?? "?"}`)];
    },

    snippets: async () => {
      const data = await apiFetch("/api/admin", { method: "POST", body: JSON.stringify({ command: "list_code" }) });
      if (!data?.snippets?.length) return [mkLine("info", "No saved snippets yet. Use: save <code>")];
      return [
        mkLine("info", `── Saved Code Snippets (${data.snippets.length}) ─────────────────────────`),
        ...data.snippets.flatMap((s: string, i: number) => [
          mkLine("info", `  ── Snippet ${i + 1} ──`),
          ...s.split("\n").map((l: string) => mkLine("output", `  ${l}`)),
        ]),
      ];
    },

    clear: async () => { setLines(WELCOME); return []; },
  };

  async function runCommand(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    push(mkLine("input", `$ ${trimmed}`));
    setHistory(h => [trimmed, ...h.slice(0, 49)]);
    setHistIdx(-1);

    const [cmd, ...args] = trimmed.split(/\s+/);

    // Special: bot subcommands
    if (cmd === "bot") {
      const sub = args[0];
      if (sub === "stop" && args[1]) {
        const data = await apiFetch(`/api/luna/bots/${args[1]}`, { method: "PATCH", body: JSON.stringify({ status: "stopped" }) });
        push(mkLine(data.success ? "success" : "error", data.success ? `✓ Bot ${args[1]} stopped` : data.error));
        return;
      }
      if (sub === "live" && args[1]) {
        const data = await apiFetch(`/api/luna/bots/${args[1]}`, { method: "PATCH", body: JSON.stringify({ mode: "live" }) });
        push(mkLine(data.success ? "success" : "error", data.success ? `⚡ Bot ${args[1]} → LIVE MODE` : data.error));
        return;
      }
      if (sub === "create") {
        try {
          const json = JSON.parse(args.slice(1).join(" "));
          const data = await apiFetch("/api/luna/bots", { method: "POST", body: JSON.stringify(json) });
          push(mkLine(data.success ? "success" : "error", data.success ? `✓ Bot "${data.data.name}" created [${data.data.id}]` : data.error));
        } catch { push(mkLine("error", "Invalid JSON. Example: bot create {\"name\":\"X\",\"coinPair\":\"BTC/USDT\"}")); }
        return;
      }
      push(mkLine("error", "Usage: bot create <json> | bot stop <id> | bot live <id>"));
      return;
    }

    // Special: signal inject
    if (cmd === "signal" && args[0] === "inject") {
      const [, , pair, indicator, value] = [cmd, ...args];
      const data = await apiFetch("/api/luna/signals", { method: "POST", body: JSON.stringify({ coinPair: pair ?? "BTC/USDT", indicator: indicator ?? "RSI", value: parseFloat(value ?? "28"), triggered: true, severity: "warn" }) });
      push(mkLine(data.success ? "success" : "error", data.success ? `✓ Signal injected: ${indicator} on ${pair} = ${value}` : data.error));
      return;
    }

    // Special: admin subcommands
    if (cmd === "admin") {
      const sub = args[0];
      const cmdMap: Record<string, string> = { "reset-bots": "reset_bots", "clear-signals": "clear_signals" };
      if (sub === "setting" && args[1] && args[2]) {
        const data = await apiFetch("/api/admin", { method: "POST", body: JSON.stringify({ command: "update_setting", payload: { [args[1]]: args[2] } }) });
        push(mkLine(data.success ? "success" : "error", data.success ? `✓ Setting ${args[1]} = ${args[2]}` : data.error));
        return;
      }
      if (cmdMap[sub]) {
        const data = await apiFetch("/api/admin", { method: "POST", body: JSON.stringify({ command: cmdMap[sub] }) });
        push(mkLine(data.success ? "success" : "error", data.success ? `✓ ${sub} executed` : data.error));
        return;
      }
      push(mkLine("error", "Usage: admin reset-bots | admin clear-signals | admin setting <key> <val>"));
      return;
    }

    const handler = COMMANDS[cmd];
    if (handler) {
      const result = await handler(args);
      if (result.length) push(...result);
    } else {
      push(mkLine("error", `Unknown command: "${cmd}". Type help for commands.`));
    }
  }

  const lineColors: Record<TermLine["type"], string> = {
    input:   "#FFB700",
    output:  "rgba(255,255,255,0.75)",
    error:   "#FF006E",
    info:    "#9B5DE5",
    success: "#00FF88",
  };

  return (
    <LunaLayout
      title="ADMIN TERMINAL"
      subtitle="Termux API console · Code editor · AI assistant · Offline-capable"
      headerRight={<PulseIndicator color="green" label="API ONLINE" />}
    >
      {/* ── Quick Stats bar ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "API Base URL", value: baseUrl, color: "#00F5FF" },
          { label: "Admin Key", value: "luna-admin-dev", color: "#FFB700" },
          { label: "Auth Header", value: "X-Luna-Key: <key>", color: "#9B5DE5" },
          { label: "Offline PWA", value: "Installed via /manifest.json", color: "#00FF88" },
        ].map(item => (
          <NeonCard key={item.label} accent="cyan" padding={12}>
            <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.label}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: item.color, wordBreak: "break-all" }}>{item.value}</div>
          </NeonCard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14 }}>
        {/* ── Terminal window ──────────────────────────────── */}
        <NeonCard accent="cyan" padding={0} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(0,245,255,0.12)", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
            <PulseIndicator color="green" size={7} />
            <span style={{ fontFamily: head, fontWeight: 700, fontSize: 13, color: "#00F5FF", letterSpacing: "0.1em" }}>LUNA TERMINAL</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>Termux-Compatible REST Console</span>
            <button onClick={() => setLines(WELCOME)} style={{ marginLeft: "auto", fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.35)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>CLEAR</button>
          </div>

          {/* Output area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 0", background: "rgba(5,8,16,0.9)", minHeight: 400, maxHeight: "calc(100vh - 380px)" }}>
            {lines.map(line => (
              <div key={line.id} style={{ padding: "1px 16px", fontFamily: mono, fontSize: 12, color: lineColors[line.type], lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {line.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderTop: "1px solid rgba(0,245,255,0.12)", background: "rgba(0,0,0,0.5)" }}>
            <span style={{ fontFamily: mono, fontSize: 13, color: "#00FF88" }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { runCommand(input); setInput(""); }
                if (e.key === "ArrowUp") {
                  const idx = Math.min(histIdx + 1, history.length - 1);
                  setHistIdx(idx);
                  setInput(history[idx] ?? "");
                }
                if (e.key === "ArrowDown") {
                  const idx = Math.max(histIdx - 1, -1);
                  setHistIdx(idx);
                  setInput(idx === -1 ? "" : history[idx]);
                }
              }}
              placeholder="Type a command… (try: help, bots, signals, termux)"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: mono, fontSize: 13, color: "#FFB700", caretColor: "#00F5FF" }}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="none"
            />
          </div>
        </NeonCard>

        {/* ── Quick Actions sidebar ────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <NeonCard accent="violet" padding={14}>
            <SectionHeader title="QUICK COMMANDS" accent="violet" />
            {[
              ["status",     "System health"],
              ["bots",       "List all bots"],
              ["signals",    "Active signals"],
              ["portfolio",  "Portfolio"],
              ["strategies", "Strategies"],
              ["activity 10","Recent events"],
              ["api",        "All API routes"],
              ["termux",     "Termux curl guide"],
            ].map(([cmd, desc]) => (
              <button key={cmd} onClick={() => { setInput(cmd); inputRef.current?.focus(); }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "rgba(155,93,229,0.06)", border: "1px solid rgba(155,93,229,0.15)", borderRadius: 5, padding: "7px 10px", marginBottom: 4, cursor: "pointer" }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: "#9B5DE5" }}>{cmd}</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{desc}</span>
              </button>
            ))}
          </NeonCard>

          <NeonCard accent="amber" padding={14}>
            <SectionHeader title="TERMUX SETUP" subtitle="Paste in your phone terminal" accent="amber" />
            <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              <div style={{ color: "#FFB700", marginBottom: 4 }}># 1. Install Termux on Android</div>
              <div style={{ color: "#FFB700", marginBottom: 8 }}># 2. Run these commands:</div>
              {[
                "pkg install curl jq",
                `export LUNA="${baseUrl}"`,
                'export KEY="luna-admin-dev"',
                "",
                "# Test connection:",
                `curl -s "$LUNA/api/health"`,
              ].map((l, i) => (
                <div key={i} style={{ color: l.startsWith("#") ? "#9B5DE5" : l === "" ? "transparent" : "#00F5FF" }}>{l || " "}</div>
              ))}
            </div>
          </NeonCard>

          <NeonCard accent="green" padding={14}>
            <SectionHeader title="PWA / OFFLINE" subtitle="Install on phone as app" accent="green" />
            <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              <div style={{ color: "#00FF88", marginBottom: 6 }}>Chrome/Android:</div>
              <div>1. Open in Chrome browser</div>
              <div>2. Tap ⋮ menu → "Add to Home Screen"</div>
              <div>3. LUNA installs as standalone app</div>
              <div style={{ marginTop: 8, color: "#00FF88" }}>iOS/Safari:</div>
              <div>1. Open in Safari</div>
              <div>2. Tap Share → "Add to Home Screen"</div>
              <div style={{ marginTop: 8, color: "rgba(0,255,136,0.5)", fontSize: 9 }}>Offline: API returns cached data when no network</div>
            </div>
          </NeonCard>
        </div>
      </div>
    </LunaLayout>
  );
}
