"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, SectionHeader } from "@/components/luna/NeonCard";

const mono = "var(--font-jetbrains-mono, monospace)";
const head = "var(--font-inter-tight, sans-serif)";

const BASE = typeof window !== "undefined" ? window.location.origin : "http://YOUR_SERVER:13000";

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  desc: string;
  params?: string;
  body?: string;
  curl: string;
  response: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "#00F5FF", POST: "#00FF88", PATCH: "#FFB700", PUT: "#9B5DE5", DELETE: "#FF006E",
};

const ENDPOINT_GROUPS: { group: string; color: string; endpoints: Endpoint[] }[] = [
  {
    group: "System",
    color: "#00F5FF",
    endpoints: [
      { method: "GET", path: "/api/health", desc: "Health check — use for Termux connection test", curl: `curl -s "$LUNA/api/health"`, response: `{"success":true,"message":"ok"}` },
      { method: "GET", path: "/api/luna/system", desc: "Full system status — all 12 LUNA layers, bot counts, portfolio value", curl: `curl -s "$LUNA/api/luna/system" | jq '.data.metrics'`, response: `{"activeBots":3,"liveBots":1,"activeSignals":5,"totalPnl":6610,"portfolioValue":63982}` },
      { method: "POST", path: "/api/luna/system", desc: "Update system settings", body: `{"mode":"live","autoRefresh":false}`, curl: `curl -s -X POST "$LUNA/api/luna/system" -H "Content-Type: application/json" -d '{"mode":"live"}' | jq`, response: `{"success":true,"settings":{...}}` },
    ],
  },
  {
    group: "Bots",
    color: "#9B5DE5",
    endpoints: [
      { method: "GET", path: "/api/luna/bots", desc: "List all trading bots", params: "?mode=simulation|live  ?status=running|paused|stopped", curl: `curl -s "$LUNA/api/luna/bots?status=running" | jq '.data[].name'`, response: `{"success":true,"count":3,"data":[...],"meta":{"totalPnl":6610}}` },
      { method: "POST", path: "/api/luna/bots", desc: "Create a new bot", body: `{"name":"SIGMA-7","coinPair":"BTC/USDT","strategy":"RSI Reversal v2","mode":"simulation"}`, curl: `curl -s -X POST "$LUNA/api/luna/bots" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"SIGMA-7","coinPair":"BTC/USDT"}' | jq`, response: `{"success":true,"data":{"id":"bXXX","name":"SIGMA-7",...}}` },
      { method: "GET", path: "/api/luna/bots/:id", desc: "Get a single bot by ID", curl: `curl -s "$LUNA/api/luna/bots/b1" | jq`, response: `{"success":true,"data":{...full bot object...}}` },
      { method: "PATCH", path: "/api/luna/bots/:id", desc: "Update bot status, mode, balance", body: `{"status":"stopped"}  OR  {"mode":"live"}  OR  {"totalPnl":500}`, curl: `curl -s -X PATCH "$LUNA/api/luna/bots/b1" \\\n  -H "Content-Type: application/json" \\\n  -d '{"status":"stopped"}' | jq`, response: `{"success":true,"data":{...updated bot...}}` },
      { method: "DELETE", path: "/api/luna/bots/:id", desc: "Delete a bot permanently", curl: `curl -s -X DELETE "$LUNA/api/luna/bots/b1" | jq`, response: `{"success":true,"deleted":"b1"}` },
    ],
  },
  {
    group: "Signals",
    color: "#FF006E",
    endpoints: [
      { method: "GET", path: "/api/luna/signals", desc: "List all crypto signals", params: "?triggered=true  ?pair=BTC/USDT  ?indicator=RSI  ?severity=critical  ?limit=20", curl: `curl -s "$LUNA/api/luna/signals?triggered=true" | jq '.data[] | {pair:.coinPair,ind:.indicator,val:.value}'`, response: `{"success":true,"count":5,"data":[...],"meta":{"critical":2,"triggered":5}}` },
      { method: "POST", path: "/api/luna/signals", desc: "Inject a signal (from TradingView webhook or Termux)", body: `{"coinPair":"BTC/USDT","indicator":"RSI","value":28.4,"threshold":30,"triggered":true,"severity":"critical"}`, curl: `curl -s -X POST "$LUNA/api/luna/signals" \\\n  -H "Content-Type: application/json" \\\n  -d '{"coinPair":"BTC/USDT","indicator":"RSI","value":28,"triggered":true}' | jq`, response: `{"success":true,"data":{"id":"sXXX",...}}` },
      { method: "DELETE", path: "/api/luna/signals", desc: "Clear all signals", curl: `curl -s -X DELETE "$LUNA/api/luna/signals" | jq`, response: `{"success":true,"cleared":true}` },
    ],
  },
  {
    group: "Strategies",
    color: "#00FF88",
    endpoints: [
      { method: "GET", path: "/api/luna/strategies", desc: "List all strategies", params: "?status=active|draft|archived", curl: `curl -s "$LUNA/api/luna/strategies" | jq '.data[] | {name:.name,wr:.winRate}'`, response: `{"success":true,"count":4,"data":[...]}` },
      { method: "POST", path: "/api/luna/strategies", desc: "Create a strategy", body: `{"name":"My RSI Strategy","signalConditions":"RSI < 30 + Volume > 2x","status":"draft"}`, curl: `curl -s -X POST "$LUNA/api/luna/strategies" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"My Strategy","signalConditions":"RSI < 30"}' | jq`, response: `{"success":true,"data":{...}}` },
      { method: "PUT", path: "/api/luna/strategies", desc: "Update a strategy (full replace)", body: `{"id":"st1","name":"Updated","winRate":72,"status":"active"}`, curl: `curl -s -X PUT "$LUNA/api/luna/strategies" \\\n  -H "Content-Type: application/json" \\\n  -d '{"id":"st1","winRate":72}' | jq`, response: `{"success":true,"data":{...updated...}}` },
      { method: "DELETE", path: "/api/luna/strategies", desc: "Delete a strategy", params: "?id=st1", curl: `curl -s -X DELETE "$LUNA/api/luna/strategies?id=st1" | jq`, response: `{"success":true,"deleted":"st1"}` },
    ],
  },
  {
    group: "Portfolio",
    color: "#FFB700",
    endpoints: [
      { method: "GET", path: "/api/luna/portfolio", desc: "Get portfolio with totals and performers", curl: `curl -s "$LUNA/api/luna/portfolio" | jq '{total:.meta.totalUsd,assets:(.data|length)}'`, response: `{"success":true,"data":[...],"meta":{"totalUsd":63982}}` },
      { method: "POST", path: "/api/luna/portfolio", desc: "Update or add an asset", body: `{"symbol":"BTC","balance":0.5,"usdValue":33600,"change24h":3.2}`, curl: `curl -s -X POST "$LUNA/api/luna/portfolio" \\\n  -H "Content-Type: application/json" \\\n  -d '{"symbol":"BTC","balance":0.5,"usdValue":33600}' | jq`, response: `{"success":true,"data":{...}}` },
    ],
  },
  {
    group: "Activity",
    color: "#9B5DE5",
    endpoints: [
      { method: "GET", path: "/api/luna/activity", desc: "Get activity log", params: "?severity=critical|warn|info|live  ?layer=V2  ?limit=50", curl: `curl -s "$LUNA/api/luna/activity?severity=critical&limit=5" | jq '.data[].message'`, response: `{"success":true,"count":3,"data":[...]}` },
      { method: "POST", path: "/api/luna/activity", desc: "Log a custom event", body: `{"message":"Custom event from Termux","layer":"V1","severity":"info","eventType":"CUSTOM"}`, curl: `curl -s -X POST "$LUNA/api/luna/activity" \\\n  -H "Content-Type: application/json" \\\n  -d '{"message":"Hello from phone"}' | jq`, response: `{"success":true}` },
      { method: "DELETE", path: "/api/luna/activity", desc: "Clear activity log", curl: `curl -s -X DELETE "$LUNA/api/luna/activity" | jq`, response: `{"success":true,"cleared":true}` },
    ],
  },
  {
    group: "Chat",
    color: "#00F5FF",
    endpoints: [
      { method: "POST", path: "/api/luna/chat", desc: "Send a message to LUNA — intelligently routed to correct layer agent", body: `{"message":"What are the active signals?"}`, curl: `curl -s -X POST "$LUNA/api/luna/chat" \\\n  -H "Content-Type: application/json" \\\n  -d '{"message":"Show bot performance"}' | jq '.lunaResponse.content'`, response: `{"success":true,"userMessage":{...},"lunaResponse":{"layer":"[V5:AGENT]","content":"..."}}` },
    ],
  },
  {
    group: "Admin",
    color: "#FF006E",
    endpoints: [
      { method: "GET", path: "/api/admin", desc: "Admin overview — requires X-Luna-Key header", curl: `curl -s -H "X-Luna-Key: $KEY" "$LUNA/api/admin" | jq`, response: `{"success":true,"admin":true,"store_summary":{...},"endpoints":{...}}` },
      { method: "POST", path: "/api/admin", desc: "Run admin command: reset_bots | clear_signals | inject_signal | save_code | list_code | update_setting", body: `{"command":"reset_bots"}\n{"command":"inject_signal","payload":{"coinPair":"BTC/USDT","indicator":"RSI","value":28}}\n{"command":"save_code","payload":{"code":"curl $LUNA/api/luna/bots"}}\n{"command":"update_setting","payload":{"mode":"live"}}`, curl: `curl -s -X POST "$LUNA/api/admin" \\\n  -H "X-Luna-Key: $KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"command":"reset_bots"}' | jq`, response: `{"success":true,"message":"All bots stopped"}` },
    ],
  },
];

export default function ApiDocsPage() {
  const [expandedGroup, setExpandedGroup] = useState<string | null>("System");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text.replace(/\$LUNA/g, BASE).replace(/\$KEY/g, "luna-admin-dev")).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <LunaLayout title="API DOCUMENTATION" subtitle="Full REST API reference · Termux curl examples · Webhook integration">
      {/* Intro banner */}
      <NeonCard accent="cyan" padding={16} style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Base URL", value: BASE, color: "#00F5FF" },
            { label: "Admin Key Header", value: "X-Luna-Key: luna-admin-dev", color: "#FFB700" },
            { label: "Content-Type", value: "application/json", color: "#9B5DE5" },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: item.color, wordBreak: "break-all" }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 6, fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
          <span style={{ color: "#FFB700" }}># Termux quick start:</span><br />
          <span style={{ color: "#00FF88" }}>export LUNA=&quot;{BASE}&quot;</span><br />
          <span style={{ color: "#00FF88" }}>export KEY=&quot;luna-admin-dev&quot;</span><br />
          <span style={{ color: "#00F5FF" }}>curl -s &quot;$LUNA/api/health&quot;  # test connection</span>
        </div>
      </NeonCard>

      {/* Endpoint groups */}
      {ENDPOINT_GROUPS.map(group => (
        <div key={group.group} style={{ marginBottom: 10 }}>
          <button
            onClick={() => setExpandedGroup(expandedGroup === group.group ? null : group.group)}
            style={{ width: "100%", background: expandedGroup === group.group ? `rgba(${group.color === "#00F5FF" ? "0,245,255" : group.color === "#9B5DE5" ? "155,93,229" : group.color === "#FF006E" ? "255,0,110" : group.color === "#00FF88" ? "0,255,136" : "255,183,0"},0.06)` : "#0D1526", border: `1px solid ${group.color}33`, borderRadius: 8, padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: head, fontWeight: 700, fontSize: 15, color: group.color }}>{group.group}</span>
              <span style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{group.endpoints.length} endpoints</span>
            </div>
            <span style={{ color: group.color, fontSize: 14 }}>{expandedGroup === group.group ? "▾" : "▸"}</span>
          </button>

          {expandedGroup === group.group && (
            <div style={{ border: `1px solid ${group.color}22`, borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
              {group.endpoints.map((ep, i) => (
                <div key={ep.path + ep.method} style={{ padding: "16px 18px", borderBottom: i < group.endpoints.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined, background: i % 2 === 0 ? "rgba(13,21,38,0.9)" : "rgba(5,8,16,0.9)" }}>
                  {/* Method + Path */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: METHOD_COLORS[ep.method], background: `${METHOD_COLORS[ep.method]}18`, border: `1px solid ${METHOD_COLORS[ep.method]}44`, borderRadius: 4, padding: "2px 8px", letterSpacing: "0.1em" }}>{ep.method}</span>
                    <span style={{ fontFamily: mono, fontSize: 13, color: "#fff" }}>{ep.path}</span>
                    {ep.params && <span style={{ fontFamily: mono, fontSize: 10, color: "#9B5DE5", opacity: 0.8 }}>{ep.params}</span>}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>{ep.desc}</div>

                  {/* Body + curl side by side */}
                  <div style={{ display: "grid", gridTemplateColumns: ep.body ? "1fr 1fr" : "1fr", gap: 10 }}>
                    {ep.body && (
                      <div>
                        <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4, letterSpacing: "0.1em" }}>REQUEST BODY</div>
                        <pre style={{ margin: 0, padding: "8px 12px", background: "rgba(0,0,0,0.4)", borderRadius: 5, fontFamily: mono, fontSize: 10, color: "#9B5DE5", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{ep.body}</pre>
                      </div>
                    )}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>CURL EXAMPLE</div>
                        <button onClick={() => copy(ep.curl, ep.path + ep.method)}
                          style={{ fontFamily: mono, fontSize: 9, color: copiedId === ep.path + ep.method ? "#00FF88" : "rgba(0,245,255,0.6)", background: "transparent", border: `1px solid ${copiedId === ep.path + ep.method ? "#00FF88" : "rgba(0,245,255,0.2)"}`, borderRadius: 3, padding: "1px 7px", cursor: "pointer" }}>
                          {copiedId === ep.path + ep.method ? "✓ COPIED" : "COPY"}
                        </button>
                      </div>
                      <pre style={{ margin: 0, padding: "8px 12px", background: "rgba(0,0,0,0.4)", borderRadius: 5, fontFamily: mono, fontSize: 10, color: "#00F5FF", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{ep.curl}</pre>
                    </div>
                  </div>

                  {/* Response example */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 3, letterSpacing: "0.1em" }}>RESPONSE</div>
                    <pre style={{ margin: 0, padding: "6px 12px", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.1)", borderRadius: 5, fontFamily: mono, fontSize: 10, color: "rgba(0,255,136,0.8)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{ep.response}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </LunaLayout>
  );
}
