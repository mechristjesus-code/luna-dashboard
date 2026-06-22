"use client";

import { useState, useEffect, useRef } from "react";
import { ActivityLogEntry, formatTime } from "@/lib/luna/data";

interface ActivityFeedProps {
  entries: ActivityLogEntry[];
  maxHeight?: number;
  showHeader?: boolean;
  compact?: boolean;
}

const SEVERITY_COLORS = {
  info:     { text: "rgba(255,255,255,0.65)", border: "rgba(0,245,255,0.15)", tag: "#00F5FF" },
  warn:     { text: "#FFB700",                border: "rgba(255,183,0,0.25)",  tag: "#FFB700" },
  error:    { text: "#FF006E",                border: "rgba(255,0,110,0.25)", tag: "#FF006E" },
  critical: { text: "#FF006E",                border: "rgba(255,0,110,0.35)", tag: "#FF006E" },
  live:     { text: "#FFB700",                border: "rgba(255,183,0,0.35)", tag: "#FFB700" },
};

function ActivityEntry({ entry, compact }: { entry: ActivityLogEntry; compact?: boolean }) {
  const colors = SEVERITY_COLORS[entry.severity] ?? SEVERITY_COLORS.info;
  return (
    <div style={{
      display: "flex",
      gap: 8,
      padding: compact ? "4px 10px" : "7px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      borderLeft: `2px solid ${colors.border}`,
      transition: "background 0.2s",
    }}>
      <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", marginTop: 1 }}>
        {formatTime(entry.timestamp)}
      </span>
      <span style={{
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        fontSize: 9,
        color: colors.tag,
        border: `1px solid ${colors.tag}44`,
        borderRadius: 3,
        padding: "1px 5px",
        whiteSpace: "nowrap",
        letterSpacing: "0.08em",
        alignSelf: "flex-start",
        marginTop: 1,
      }}>
        {entry.layer}
      </span>
      {entry.severity === "live" && (
        <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#FFB700", border: "1px solid #FFB70044", borderRadius: 3, padding: "1px 5px", letterSpacing: "0.08em", alignSelf: "flex-start", marginTop: 1 }}>
          [LIVE]
        </span>
      )}
      <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: colors.text, flex: 1, lineHeight: 1.5 }}>
        {entry.message}
      </span>
    </div>
  );
}

export function ActivityFeed({ entries, maxHeight = 320, showHeader = true, compact = false }: ActivityFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [entries, autoScroll]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {showHeader && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "rgba(0,0,0,0.3)",
          borderBottom: "1px solid rgba(0,245,255,0.1)",
          borderRadius: "8px 8px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00F5FF", boxShadow: "0 0 6px #00F5FF", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontSize: 12, fontWeight: 600, color: "#00F5FF", letterSpacing: "0.08em" }}>
              ACTIVITY FEED
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>
              {entries.length} events
            </span>
          </div>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            style={{
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: 9,
              color: autoScroll ? "#00F5FF" : "rgba(255,255,255,0.35)",
              background: "transparent",
              border: `1px solid ${autoScroll ? "rgba(0,245,255,0.3)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            {autoScroll ? "AUTO" : "PAUSED"}
          </button>
        </div>
      )}
      <div
        style={{
          maxHeight,
          overflowY: "auto",
          background: "rgba(5,8,16,0.8)",
          borderRadius: showHeader ? "0 0 8px 8px" : 8,
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
          setAutoScroll(atBottom);
        }}
      >
        {entries.slice().reverse().map((entry) => (
          <ActivityEntry key={entry.id} entry={entry} compact={compact} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
