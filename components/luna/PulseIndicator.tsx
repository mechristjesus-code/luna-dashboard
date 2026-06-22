"use client";

interface PulseIndicatorProps {
  color?: "cyan" | "amber" | "green" | "magenta";
  size?: number;
  label?: string;
  labelStyle?: React.CSSProperties;
}

const COLOR_MAP = {
  cyan:    "#00F5FF",
  amber:   "#FFB700",
  green:   "#00FF88",
  magenta: "#FF006E",
};

export function PulseIndicator({ color = "green", size = 8, label, labelStyle }: PulseIndicatorProps) {
  const hex = COLOR_MAP[color];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ position: "relative", display: "inline-flex", width: size, height: size }}>
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: hex,
            opacity: 0.35,
            animation: `ping 1.4s cubic-bezier(0,0,0.2,1) infinite`,
          }}
        />
        <span
          style={{
            position: "relative",
            display: "inline-block",
            width: size,
            height: size,
            borderRadius: "50%",
            background: hex,
            boxShadow: `0 0 6px ${hex}`,
          }}
        />
      </span>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            fontSize: 10,
            color: hex,
            letterSpacing: "0.1em",
            textShadow: `0 0 6px ${hex}55`,
            ...labelStyle,
          }}
        >
          {label}
        </span>
      )}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </span>
  );
}

interface LiveBadgeProps {
  mode: "simulation" | "live";
}

export function LiveBadge({ mode }: LiveBadgeProps) {
  if (mode === "live") {
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(255,183,0,0.12)",
        border: "1px solid rgba(255,183,0,0.4)",
        borderRadius: 4,
        padding: "2px 7px",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        fontSize: 9,
        color: "#FFB700",
        letterSpacing: "0.12em",
        fontWeight: 700,
      }}>
        <PulseIndicator color="amber" size={5} />
        LIVE
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      background: "rgba(0,245,255,0.08)",
      border: "1px solid rgba(0,245,255,0.25)",
      borderRadius: 4,
      padding: "2px 7px",
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: 9,
      color: "#00F5FF",
      letterSpacing: "0.12em",
    }}>
      SIM
    </span>
  );
}

interface StatusBadgeProps {
  status: "running" | "paused" | "stopped" | "online" | "idle" | "processing" | "error" | "draft" | "active" | "archived";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    running:    { color: "#00FF88", bg: "rgba(0,255,136,0.1)", label: "RUNNING" },
    online:     { color: "#00FF88", bg: "rgba(0,255,136,0.1)", label: "ONLINE" },
    active:     { color: "#00FF88", bg: "rgba(0,255,136,0.1)", label: "ACTIVE" },
    processing: { color: "#FFB700", bg: "rgba(255,183,0,0.1)", label: "PROCESSING" },
    paused:     { color: "#FFB700", bg: "rgba(255,183,0,0.1)", label: "PAUSED" },
    draft:      { color: "#9B5DE5", bg: "rgba(155,93,229,0.1)", label: "DRAFT" },
    idle:       { color: "#9B5DE5", bg: "rgba(155,93,229,0.1)", label: "IDLE" },
    stopped:    { color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.05)", label: "STOPPED" },
    error:      { color: "#FF006E", bg: "rgba(255,0,110,0.1)", label: "ERROR" },
    archived:   { color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.05)", label: "ARCHIVED" },
  };
  const c = config[status] ?? config.idle;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      background: c.bg,
      border: `1px solid ${c.color}44`,
      borderRadius: 4,
      padding: "2px 7px",
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: 9,
      color: c.color,
      letterSpacing: "0.1em",
    }}>
      {(status === "running" || status === "online") && <PulseIndicator color="green" size={5} />}
      {(status === "processing") && <PulseIndicator color="amber" size={5} />}
      {c.label}
    </span>
  );
}
