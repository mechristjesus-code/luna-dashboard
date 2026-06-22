"use client";
import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge } from "@/components/luna/PulseIndicator";

type CheckKey = "auth" | "db" | "billing" | "cicd" | "cloud";
const CHECK_LABELS: Record<CheckKey, string> = { auth: "Auth Ready", db: "DB Ready", billing: "Billing Ready", cicd: "CI/CD Ready", cloud: "Cloud Ready" };
const CHECK_KEYS: CheckKey[] = ["auth", "db", "billing", "cicd", "cloud"];

interface Company { id: string; name: string; type: string; checks: Record<CheckKey, boolean>; }

const INIT_COMPANIES: Company[] = [
  { id: "c1", name: "CryptoSignal Pro API",    type: "SaaS",         checks: { auth: true,  db: true,  billing: true,  cicd: true,  cloud: true  } },
  { id: "c2", name: "Alpha Fund Strategies",   type: "Fund",         checks: { auth: true,  db: true,  billing: true,  cicd: true,  cloud: false } },
  { id: "c3", name: "Market Intelligence Suite",type: "Intelligence",checks: { auth: true,  db: true,  billing: false, cicd: false, cloud: false } },
  { id: "c4", name: "Momentum Tracker API",    type: "SaaS",         checks: { auth: true,  db: true,  billing: true,  cicd: false, cloud: false } },
];

function score(c: Company) {
  return Math.round((Object.values(c.checks).filter(Boolean).length / CHECK_KEYS.length) * 100);
}

function ScoreBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "#00FF88" : pct >= 60 ? "#FFB700" : "#FF006E";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, boxShadow: `0 0 6px ${color}88`, transition: "width 0.3s ease" }} />
      </div>
      <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color, minWidth: 36 }}>{pct}%</span>
    </div>
  );
}

export default function V11GlobalStack() {
  const [companies, setCompanies] = useState<Company[]>(INIT_COMPANIES);

  function toggle(cId: string, key: CheckKey) {
    setCompanies((prev) => prev.map((c) => c.id === cId ? { ...c, checks: { ...c.checks, [key]: !c.checks[key] } } : c));
  }

  const scores = companies.map(score);
  const avgScore = Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
  const allReady = companies.filter((c) => score(c) === 100).length;
  const totalPassed = companies.reduce((s, c) => s + Object.values(c.checks).filter(Boolean).length, 0);
  const inProgress = companies.filter((c) => { const s = score(c); return s > 0 && s < 100; }).length;

  const typeColor: Record<string, string> = { SaaS: "#00F5FF", Fund: "#9B5DE5", Intelligence: "#00FF88" };

  return (
    <LunaLayout title="GLOBAL DEPLOYMENT STACK" subtitle="V11 · Production readiness checklist">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Avg Production Score" value={`${avgScore}%`} accent="cyan" icon="📊" />
        <MetricTile label="Companies Ready" value={allReady} accent="green" icon="✅" />
        <MetricTile label="Total Checks Passed" value={totalPassed} accent="violet" icon="☑️" />
        <MetricTile label="In Progress" value={inProgress} accent="amber" icon="⚙️" />
      </div>

      <NeonCard accent="cyan" style={{ marginBottom: 20 }}>
        <SectionHeader title="OVERALL SYSTEM READINESS" />
        <ScoreBar pct={avgScore} />
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          {companies.map((c) => (
            <div key={c.id} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 3, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name.split(" ")[0]}</div>
              <div style={{ fontFamily: "var(--font-inter-tight,sans-serif)", fontWeight: 700, fontSize: 15, color: score(c) === 100 ? "#00FF88" : score(c) >= 60 ? "#FFB700" : "#FF006E" }}>{score(c)}%</div>
            </div>
          ))}
        </div>
      </NeonCard>

      <SectionHeader title="COMPANY READINESS CHECKLIST" subtitle="Click items to toggle status" accent="violet" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {companies.map((c) => {
          const s = score(c);
          return (
            <NeonCard key={c.id} accent={s === 100 ? "green" : s >= 60 ? "amber" : "magenta"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-inter-tight,sans-serif)", fontWeight: 700, fontSize: 14, color: "#e0f7ff", marginBottom: 4 }}>{c.name}</div>
                  <span style={{ background: `${typeColor[c.type]}18`, border: `1px solid ${typeColor[c.type]}44`, borderRadius: 4, padding: "2px 7px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: typeColor[c.type], letterSpacing: "0.1em" }}>{c.type.toUpperCase()}</span>
                </div>
                <StatusBadge status={s === 100 ? "active" : s > 0 ? "processing" : "stopped"} />
              </div>
              <ScoreBar pct={s} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                {CHECK_KEYS.map((key) => (
                  <div
                    key={key}
                    onClick={() => toggle(c.id, key)}
                    style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "5px 8px", borderRadius: 5, background: c.checks[key] ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${c.checks[key] ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.08)"}`, transition: "all 0.2s" }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${c.checks[key] ? "#00FF88" : "rgba(255,255,255,0.25)"}`, background: c.checks[key] ? "#00FF88" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
                      {c.checks[key] && <span style={{ color: "#050810", fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: c.checks[key] ? "#00FF88" : "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>{CHECK_LABELS[key]}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
          );
        })}
      </div>
    </LunaLayout>
  );
}
