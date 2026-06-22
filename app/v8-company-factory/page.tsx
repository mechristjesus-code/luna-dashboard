"use client";
import { useState, useEffect } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, MetricTile, SectionHeader } from "@/components/luna/NeonCard";
import { StatusBadge } from "@/components/luna/PulseIndicator";

type CompanyType = "SaaS" | "Fund" | "Intelligence";
type CompanyStatus = "active" | "processing";

interface Company {
  id: string;
  name: string;
  type: CompanyType;
  status: CompanyStatus;
  revenue: number;
  services: number;
}

const INIT: Company[] = [
  { id: "c1", name: "CryptoSignal Pro API", type: "SaaS", status: "active", revenue: 4800, services: 3 },
  { id: "c2", name: "Alpha Fund Strategies", type: "Fund", status: "active", revenue: 12400, services: 1 },
  { id: "c3", name: "Market Intelligence Suite", type: "Intelligence", status: "processing", revenue: 2200, services: 2 },
  { id: "c4", name: "Momentum Tracker API", type: "SaaS", status: "active", revenue: 1900, services: 2 },
];

function typeBadge(t: CompanyType) {
  const cfg = {
    SaaS: { color: "#00F5FF", bg: "rgba(0,245,255,0.1)", border: "rgba(0,245,255,0.3)" },
    Fund: { color: "#9B5DE5", bg: "rgba(155,93,229,0.1)", border: "rgba(155,93,229,0.3)" },
    Intelligence: { color: "#00FF88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.3)" },
  }[t];
  return (
    <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 4, padding: "2px 7px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: cfg.color, letterSpacing: "0.1em" }}>
      {t.toUpperCase()}
    </span>
  );
}

function genId() { return "c" + Math.random().toString(36).slice(2, 8); }
function fakeKey() {
  const h = "0123456789abcdef";
  return "sk-" + Array.from({ length: 8 }, () => h[Math.floor(Math.random() * 16)]).join("");
}

function buildServices(companies: Company[]) {
  const rows: { company: string; name: string; key: string; status: "active" | "processing"; usage: number; tier: string }[] = [];
  const tiers = ["Free", "Pro", "Enterprise"];
  companies.forEach((c) => {
    const suffixes = ["Core API", "Analytics", "Feed"];
    for (let i = 0; i < c.services; i++) {
      rows.push({
        company: c.name,
        name: `${c.name} ${suffixes[i % suffixes.length]}`,
        key: fakeKey(),
        status: c.status,
        usage: Math.floor(Math.random() * 5000),
        tier: tiers[i % tiers.length],
      });
    }
  });
  return rows;
}

export default function V8CompanyFactory() {
  const [companies, setCompanies] = useState<Company[]>(INIT);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "SaaS" as CompanyType, mrr: "" });

  const totalMRR = companies.reduce((s, c) => s + c.revenue, 0);
  const totalServices = companies.reduce((s, c) => s + c.services, 0);
  const activeCount = companies.filter((c) => c.status === "active").length;

  function handleCreate() {
    if (!form.name.trim()) return;
    const id = genId();
    const newCo: Company = { id, name: form.name, type: form.type, status: "processing", revenue: Number(form.mrr) || 0, services: 1 };
    setCompanies((prev) => [...prev, newCo]);
    setForm({ name: "", type: "SaaS", mrr: "" });
    setShowForm(false);
    setTimeout(() => {
      setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, status: "active" } : c));
    }, 2000);
  }

  const services = buildServices(companies);

  const inputStyle: React.CSSProperties = {
    background: "#0a1020", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6,
    color: "#e0f7ff", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 12,
    padding: "7px 10px", outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <LunaLayout title="COMPANY FACTORY" subtitle="V8 · Automated AI company generation">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricTile label="Total Companies" value={companies.length} accent="cyan" icon="🏢" />
        <MetricTile label="Active Companies" value={activeCount} accent="green" icon="✅" />
        <MetricTile label="Simulated MRR" value={`$${totalMRR.toLocaleString()}`} accent="violet" icon="💰" />
        <MetricTile label="Total Services" value={totalServices} accent="amber" icon="⚙️" />
      </div>

      <SectionHeader title="COMPANY REGISTRY" subtitle={`${companies.length} entities`}
        right={
          <button onClick={() => setShowForm(!showForm)} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.35)", borderRadius: 6, color: "#00F5FF", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, padding: "6px 14px", cursor: "pointer", letterSpacing: "0.08em" }}>
            + GENERATE COMPANY
          </button>
        }
      />

      {showForm && (
        <NeonCard accent="violet" style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>COMPANY NAME</div>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter name..." />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>TYPE</div>
              <select style={{ ...inputStyle }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CompanyType })}>
                <option>SaaS</option><option>Fund</option><option>Intelligence</option>
              </select>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>INITIAL MRR ($)</div>
              <input style={inputStyle} type="number" value={form.mrr} onChange={(e) => setForm({ ...form, mrr: e.target.value })} placeholder="0" />
            </div>
            <button onClick={handleCreate} style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 6, color: "#00FF88", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap" }}>
              CREATE
            </button>
          </div>
        </NeonCard>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {companies.map((c) => (
          <NeonCard key={c.id} accent={c.type === "SaaS" ? "cyan" : c.type === "Fund" ? "violet" : "green"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--font-inter-tight,sans-serif)", fontWeight: 700, fontSize: 14, color: "#e0f7ff" }}>{c.name}</div>
              <StatusBadge status={c.status} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              {typeBadge(c.type)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>SIM REVENUE</div>
                <div style={{ fontFamily: "var(--font-inter-tight,sans-serif)", fontWeight: 700, fontSize: 18, color: "#00FF88", textShadow: "0 0 8px rgba(0,255,136,0.4)" }}>${c.revenue.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>SERVICES</div>
                <div style={{ fontFamily: "var(--font-inter-tight,sans-serif)", fontWeight: 700, fontSize: 18, color: "#FFB700" }}>{c.services}</div>
              </div>
            </div>
          </NeonCard>
        ))}
      </div>

      <SectionHeader title="SERVICE REGISTRY" subtitle={`${services.length} services registered`} accent="violet" />
      <NeonCard accent="violet" padding={0}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(155,93,229,0.15)" }}>
              {["Service Name", "API Key", "Status", "Usage", "Tier"].map((h) => (
                <th key={h} style={{ fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "left", padding: "10px 14px", letterSpacing: "0.1em" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "#c0d8f0" }}>{s.name}</td>
                <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{s.key}...</td>
                <td style={{ padding: "9px 14px" }}><StatusBadge status={s.status} /></td>
                <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 11, color: "#FFB700" }}>{s.usage.toLocaleString()}</td>
                <td style={{ padding: "9px 14px", fontFamily: "var(--font-jetbrains-mono,monospace)", fontSize: 10, color: s.tier === "Enterprise" ? "#00FF88" : s.tier === "Pro" ? "#00F5FF" : "rgba(255,255,255,0.4)" }}>{s.tier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </NeonCard>
    </LunaLayout>
  );
}
