"use client";
import { useLiveStream } from "@/lib/luna/useLiveStream";

const C = {
  mono: "var(--font-jetbrains-mono, monospace)",
  green: "#00FF88",
  amber: "#FFB700",
  magenta: "#FF006E",
  cyan: "#00F5FF",
};

/**
 * LiveStreamIndicator — shows SSE connection status and live PnL ticker.
 * Designed to be embedded in the LunaLayout header or any top bar.
 */
export function LiveStreamIndicator() {
  const { connected, masterStatus, activeBots, totalPnl, arbEvents, reconnectCount } = useLiveStream();

  const latestArb = arbEvents[0];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      {/* Connection status */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: connected ? C.green : C.magenta,
          boxShadow: connected ? `0 0 6px ${C.green}` : `0 0 6px ${C.magenta}`,
          display: "inline-block",
          animation: connected ? "pulse 2s ease-in-out infinite" : "none",
        }} />
        <span style={{ fontFamily: C.mono, fontSize: 9, color: connected ? C.green : C.magenta, letterSpacing: "0.1em" }}>
          {connected ? "LIVE" : reconnectCount > 0 ? `RECONNECTING (${reconnectCount})` : "OFFLINE"}
        </span>
      </div>

      {/* Master status */}
      {connected && (
        <span style={{ fontFamily: C.mono, fontSize: 9, color: masterStatus === "running" ? C.green : masterStatus === "paused" ? C.amber : C.magenta, letterSpacing: "0.08em" }}>
          MASTER: {masterStatus.toUpperCase()}
        </span>
      )}

      {/* Active bots */}
      {connected && activeBots > 0 && (
        <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
          {activeBots} BOTS
        </span>
      )}

      {/* Live PnL */}
      {connected && totalPnl !== 0 && (
        <span style={{ fontFamily: C.mono, fontSize: 9, color: totalPnl >= 0 ? C.green : C.magenta, fontWeight: 700 }}>
          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)} PnL
        </span>
      )}

      {/* Latest arb event */}
      {connected && latestArb && (
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.cyan, background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 3, padding: "1px 6px" }}>
          ⚡ ARB +${latestArb.profit.toFixed(2)}
        </span>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
