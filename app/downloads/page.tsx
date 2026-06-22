"use client";

import { useState } from "react";
import { LunaLayout } from "@/components/luna/LunaLayout";
import { NeonCard, SectionHeader } from "@/components/luna/NeonCard";
import { PulseIndicator } from "@/components/luna/PulseIndicator";

const mono = "var(--font-jetbrains-mono, monospace)";
const head = "var(--font-inter-tight, sans-serif)";

const BASE = typeof window !== "undefined" ? window.location.origin : "http://localhost:13000";

export default function DownloadsPage() {
  const [zipLoading, setZipLoading] = useState(false);
  const [zipDone, setZipDone] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  }

  function downloadZip() {
    setZipLoading(true);
    const a = document.createElement("a");
    a.href = "/api/download/zip";
    a.download = "luna-dashboard.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => { setZipLoading(false); setZipDone(true); }, 3000);
  }

  const APK_STEPS = [
    { step: "1", title: "Clone repo", cmd: "git clone https://github.com/mechristjesus-code/luna-dashboard.git" },
    { step: "2", title: "Install deps", cmd: "cd luna-dashboard && pnpm install" },
    { step: "3", title: "Install Capacitor", cmd: "pnpm add -D @capacitor/cli @capacitor/core @capacitor/android" },
    { step: "4", title: "Build & sync", cmd: "pnpm build:export && npx cap sync android" },
    { step: "5", title: "Build APK", cmd: "cd android && ./gradlew assembleDebug" },
    { step: "6", title: "Find APK", cmd: "android/app/build/outputs/apk/debug/app-debug.apk" },
  ];

  const TERMUX_STEPS = [
    { step: "1", title: "Install Termux from F-Droid", cmd: "# Download from: https://f-droid.org/packages/com.termux/" },
    { step: "2", title: "Install deps", cmd: "pkg install git nodejs-lts openjdk-17" },
    { step: "3", title: "Install pnpm", cmd: "npm install -g pnpm" },
    { step: "4", title: "Clone LUNA", cmd: "git clone https://github.com/mechristjesus-code/luna-dashboard.git" },
    { step: "5", title: "Run dev server", cmd: "cd luna-dashboard && pnpm install && pnpm dev" },
    { step: "6", title: "Open in browser", cmd: "# Open http://localhost:13000 in your phone browser" },
  ];

  return (
    <LunaLayout
      title="DOWNLOADS"
      subtitle="Source ZIP · Android APK · Termux setup · GitHub Actions build"
      headerRight={<PulseIndicator color="cyan" label="ALL BUILDS AVAILABLE" />}
    >
      {/* ── Download cards ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>

        {/* ZIP Card */}
        <NeonCard accent="cyan" padding={20}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
            <div style={{ fontFamily: head, fontWeight: 700, fontSize: 16, color: "#00F5FF", marginBottom: 4 }}>Source ZIP</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Full project source code</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            <div>✓ All 22 pages</div>
            <div>✓ 10 REST API routes</div>
            <div>✓ Components + lib</div>
            <div>✓ Android config</div>
            <div>✓ GitHub Actions CI</div>
            <div style={{ color: "rgba(255,0,110,0.6)" }}>✗ node_modules excluded</div>
          </div>
          <button onClick={downloadZip} disabled={zipLoading}
            style={{ width: "100%", padding: "10px 0", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#050810", background: zipDone ? "#00FF88" : "#00F5FF", border: "none", borderRadius: 6, cursor: zipLoading ? "wait" : "pointer", boxShadow: `0 0 16px ${zipDone ? "#00FF88" : "#00F5FF"}44` }}>
            {zipLoading ? "⏳ ZIPPING..." : zipDone ? "✓ DOWNLOADED" : "⬇ DOWNLOAD ZIP"}
          </button>
        </NeonCard>

        {/* APK Card */}
        <NeonCard accent="green" padding={20}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📱</div>
            <div style={{ fontFamily: head, fontWeight: 700, fontSize: 16, color: "#00FF88", marginBottom: 4 }}>Android APK</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Native Android app via Capacitor</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            <div>✓ Full offline capability</div>
            <div>✓ Native Android wrapper</div>
            <div>✓ Dark splash screen</div>
            <div>✓ Connects to your server API</div>
            <div>✓ Auto-built by GitHub Actions</div>
          </div>
          <a href="https://github.com/mechristjesus-code/luna-dashboard/actions" target="_blank" rel="noopener noreferrer"
            style={{ display: "block", width: "100%", padding: "10px 0", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#050810", background: "#00FF88", border: "none", borderRadius: 6, cursor: "pointer", boxShadow: "0 0 16px #00FF8844", textAlign: "center", textDecoration: "none" }}>
            ⬇ GET APK FROM ACTIONS
          </a>
        </NeonCard>

        {/* GitHub Card */}
        <NeonCard accent="violet" padding={20}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🐙</div>
            <div style={{ fontFamily: head, fontWeight: 700, fontSize: 16, color: "#9B5DE5", marginBottom: 4 }}>GitHub Repo</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Full source on GitHub</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            <div>✓ Auto APK builds on push</div>
            <div>✓ Source ZIP artifact</div>
            <div>✓ Full commit history</div>
            <div>✓ Fork & customize</div>
            <div>✓ Termux: git pull updates</div>
          </div>
          <a href="https://github.com/mechristjesus-code/luna-dashboard" target="_blank" rel="noopener noreferrer"
            style={{ display: "block", width: "100%", padding: "10px 0", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#fff", background: "#9B5DE5", border: "none", borderRadius: 6, cursor: "pointer", boxShadow: "0 0 16px #9B5DE544", textAlign: "center", textDecoration: "none" }}>
            ↗ OPEN GITHUB REPO
          </a>
        </NeonCard>
      </div>

      {/* ── APK Build Steps ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>

        <NeonCard accent="green" padding={16}>
          <SectionHeader title="BUILD APK LOCALLY" subtitle="Requires Node.js + Android Studio or JDK 17" accent="green" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {APK_STEPS.map(({ step, title, cmd }) => (
              <div key={step} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#00FF88", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{step}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>{title}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <pre style={{ margin: 0, flex: 1, fontFamily: mono, fontSize: 10, color: "#00F5FF", background: "rgba(0,0,0,0.3)", borderRadius: 4, padding: "4px 8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{cmd}</pre>
                    <button onClick={() => copy(cmd, `apk-${step}`)}
                      style={{ fontFamily: mono, fontSize: 8, color: copied === `apk-${step}` ? "#00FF88" : "rgba(0,245,255,0.5)", background: "transparent", border: `1px solid ${copied === `apk-${step}` ? "rgba(0,255,136,0.3)" : "rgba(0,245,255,0.2)"}`, borderRadius: 3, padding: "2px 6px", cursor: "pointer", whiteSpace: "nowrap" }}>
                      {copied === `apk-${step}` ? "✓" : "COPY"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

        <NeonCard accent="amber" padding={16}>
          <SectionHeader title="RUN ON PHONE VIA TERMUX" subtitle="No APK needed — run the dev server directly" accent="amber" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TERMUX_STEPS.map(({ step, title, cmd }) => (
              <div key={step} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#FFB700", background: "rgba(255,183,0,0.1)", border: "1px solid rgba(255,183,0,0.25)", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{step}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>{title}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <pre style={{ margin: 0, flex: 1, fontFamily: mono, fontSize: 10, color: "#FFB700", background: "rgba(0,0,0,0.3)", borderRadius: 4, padding: "4px 8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{cmd}</pre>
                    {!cmd.startsWith("#") && (
                      <button onClick={() => copy(cmd, `termux-${step}`)}
                        style={{ fontFamily: mono, fontSize: 8, color: copied === `termux-${step}` ? "#00FF88" : "rgba(255,183,0,0.5)", background: "transparent", border: `1px solid ${copied === `termux-${step}` ? "rgba(0,255,136,0.3)" : "rgba(255,183,0,0.2)"}`, borderRadius: 3, padding: "2px 6px", cursor: "pointer", whiteSpace: "nowrap" }}>
                        {copied === `termux-${step}` ? "✓" : "COPY"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

      </div>

      {/* ── GitHub Actions Auto Build ────────────────────────── */}
      <NeonCard accent="cyan" padding={20}>
        <SectionHeader title="GITHUB ACTIONS AUTO-BUILD" subtitle="Every push to main triggers APK + ZIP build automatically" accent="cyan" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { icon: "🔀", label: "Push to main", desc: "Triggers workflow" },
            { icon: "⚙️", label: "Build runs", desc: "~8 min on Ubuntu" },
            { icon: "📦", label: "APK artifact", desc: "Ready to download" },
            { icon: "🗜️", label: "ZIP artifact", desc: "Source code bundle" },
          ].map(item => (
            <div key={item.label} style={{ textAlign: "center", padding: 12, background: "rgba(0,245,255,0.04)", borderRadius: 6, border: "1px solid rgba(0,245,255,0.1)" }}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{item.icon}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: "#00F5FF", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="https://github.com/mechristjesus-code/luna-dashboard/actions" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: mono, fontSize: 11, color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 5, padding: "8px 16px", background: "rgba(0,245,255,0.08)", textDecoration: "none" }}>
            View GitHub Actions →
          </a>
          <button onClick={() => copy("git clone https://github.com/mechristjesus-code/luna-dashboard.git", "clone")}
            style={{ fontFamily: mono, fontSize: 11, color: "#9B5DE5", border: "1px solid rgba(155,93,229,0.3)", borderRadius: 5, padding: "8px 16px", background: "rgba(155,93,229,0.08)", cursor: "pointer" }}>
            {copied === "clone" ? "✓ Copied!" : "📋 Copy Clone Command"}
          </button>
        </div>
      </NeonCard>
    </LunaLayout>
  );
}
