"use client";
import { generateRiskHeatmap, RiskHeatmapCell } from "@/lib/luna/data";

const C = {
  mono: "var(--font-jetbrains-mono, monospace)",
  head: "var(--font-inter-tight, sans-serif)",
};

function getRiskColor(score: number): string {
  if (score >= 75) return "#FF006E";
  if (score >= 55) return "#FFB700";
  if (score >= 35) return "#00F5FF";
  return "#00FF88";
}

function getRiskLabel(score: number): string {
  if (score >= 75) return "HIGH";
  if (score >= 55) return "MED";
  if (score >= 35) return "LOW";
  return "SAFE";
}

interface RiskHeatmapProps {
  compact?: boolean;
}

export function RiskHeatmap({ compact = false }: RiskHeatmapProps) {
  const cells = generateRiskHeatmap();

  const maxExposure = Math.max(...cells.map(c => c.exposure));

  return (
    <div>
      {!compact && (
        <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
          {[
            { label: "SAFE", color: "#00FF88", range: "0–34" },
            { label: "LOW", color: "#00F5FF", range: "35–54" },
            { label: "MEDIUM", color: "#FFB700", range: "55–74" },
            { label: "HIGH", color: "#FF006E", range: "75–100" },
          ].map(({ label, color, range }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color, opacity: 0.8 }} />
              <span style={{ fontFamily: C.mono, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{label} ({range})</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
        {cells.map((cell) => {
          const color = getRiskColor(cell.riskScore);
          const label = getRiskLabel(cell.riskScore);
          const exposurePct = (cell.exposure / maxExposure) * 100;

          return (
            <div
              key={cell.botName}
              style={{
                background: `${color}0D`,
                border: `1px solid ${color}33`,
                borderRadius: 6,
                padding: compact ? "8px 10px" : "10px 12px",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${color}66`;
                e.currentTarget.style.boxShadow = `0 0 12px ${color}22`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${color}33`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Background exposure bar */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: `${exposurePct}%`,
                height: 3,
                background: `${color}55`,
                borderRadius: "0 2px 0 0",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{ fontFamily: C.head, fontWeight: 700, fontSize: compact ? 11 : 12, color: "#fff" }}>
                  {cell.botName}
                </span>
                <span style={{
                  fontFamily: C.mono,
                  fontSize: 9,
                  color: color,
                  border: `1px solid ${color}44`,
                  borderRadius: 3,
                  padding: "1px 4px",
                  letterSpacing: "0.06em",
                }}>
                  {label}
                </span>
              </div>

              <div style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                {cell.coinPair}
              </div>

              {/* Risk score bar */}
              <div style={{ marginBottom: compact ? 4 : 6 }}>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${cell.riskScore}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    borderRadius: 2,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: color, fontWeight: 700 }}>
                    {cell.riskScore}/100
                  </span>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                    ${cell.exposure.toLocaleString()}
                  </span>
                </div>
              </div>

              {!compact && (
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                    DD: <span style={{ color: cell.drawdown > 10 ? "#FF006E" : "rgba(255,255,255,0.5)" }}>{cell.drawdown}%</span>
                  </span>
                  <span style={{ fontFamily: C.mono, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                    Vol: <span style={{ color: "rgba(255,255,255,0.5)" }}>{cell.volatility}%</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.1)", borderRadius: 6 }}>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            Portfolio Risk Score: <span style={{ color: "#FFB700", fontWeight: 700 }}>58/100</span> · 
            Highest Risk: <span style={{ color: "#FF006E" }}>DELTA-9 (78)</span> · 
            Lowest Risk: <span style={{ color: "#00FF88" }}>ARB-BOT-1 (15)</span> · 
            Recommendation: <span style={{ color: "#00F5FF" }}>Reduce DELTA-9 exposure, rebalance BTC allocation</span>
          </div>
        </div>
      )}
    </div>
  );
}
