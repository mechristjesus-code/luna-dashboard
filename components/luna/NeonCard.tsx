"use client";

interface NeonCardProps {
  children: React.ReactNode;
  accent?: "cyan" | "violet" | "green" | "magenta" | "amber";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  padding?: number | string;
}

const ACCENT_MAP = {
  cyan:    { border: "rgba(0,245,255,0.22)",   glow: "rgba(0,245,255,0.07)",   text: "#00F5FF" },
  violet:  { border: "rgba(155,93,229,0.28)",  glow: "rgba(155,93,229,0.07)",  text: "#9B5DE5" },
  green:   { border: "rgba(0,255,136,0.22)",   glow: "rgba(0,255,136,0.07)",   text: "#00FF88" },
  magenta: { border: "rgba(255,0,110,0.28)",   glow: "rgba(255,0,110,0.07)",   text: "#FF006E" },
  amber:   { border: "rgba(255,183,0,0.28)",   glow: "rgba(255,183,0,0.07)",   text: "#FFB700" },
};

export function NeonCard({ children, accent = "cyan", className, style, onClick, padding = 16 }: NeonCardProps) {
  const colors = ACCENT_MAP[accent];
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: "#0D1526",
        border: `1px solid ${colors.border}`,
        boxShadow: `0 0 16px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        borderRadius: 8,
        padding,
        cursor: onClick ? "pointer" : undefined,
        transition: "box-shadow 0.2s, border-color 0.2s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface MetricTileProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "cyan" | "violet" | "green" | "magenta" | "amber";
  icon?: string;
}

export function MetricTile({ label, value, sub, accent = "cyan", icon }: MetricTileProps) {
  const colors = ACCENT_MAP[accent];
  return (
    <NeonCard accent={accent} padding={16}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 26, color: colors.text, textShadow: `0 0 10px ${colors.text}55`, lineHeight: 1 }}>
            {value}
          </div>
          {sub && (
            <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 5 }}>
              {sub}
            </div>
          )}
        </div>
        {icon && (
          <div style={{ fontSize: 22, color: colors.text, opacity: 0.6 }}>{icon}</div>
        )}
      </div>
    </NeonCard>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: "cyan" | "violet" | "green" | "magenta" | "amber";
  right?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, accent = "cyan", right }: SectionHeaderProps) {
  const colors = ACCENT_MAP[accent];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 20, background: colors.text, borderRadius: 2, boxShadow: `0 0 6px ${colors.text}` }} />
        <div>
          <div style={{ fontFamily: "var(--font-inter-tight, sans-serif)", fontWeight: 700, fontSize: 14, color: colors.text, letterSpacing: "0.05em" }}>{title}</div>
          {subtitle && <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
