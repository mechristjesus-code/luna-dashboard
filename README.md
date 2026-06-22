# ✦ LUNA Dashboard — AI Command Center

> **Full-stack sci-fi holographic AI command center** · V1–V12 Architecture · Crypto Trading Bots · Economy Simulation · Termux API · PWA

![LUNA](https://img.shields.io/badge/LUNA-V1--V12-00F5FF?style=for-the-badge&labelColor=050810)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![PWA](https://img.shields.io/badge/PWA-Offline_Ready-00FF88?style=for-the-badge)

---

## 🚀 Quick Start

```bash
git clone https://github.com/mechristjesus-code/luna-dashboard.git
cd luna-dashboard
pnpm install
pnpm dev
# Open http://localhost:13000
```

---

## 📱 Termux Phone Control

Control LUNA from Android phone via Termux:

```bash
pkg install curl jq
export LUNA="http://YOUR_SERVER_IP:13000"
export KEY="luna-admin-dev"

# Test connection
curl -s "$LUNA/api/health"

# List running bots
curl -s "$LUNA/api/luna/bots?status=running" | jq '.data[].name'

# Stop a bot
curl -s -X PATCH "$LUNA/api/luna/bots/b1" \
  -H "Content-Type: application/json" \
  -d '{"status":"stopped"}' | jq

# Create a bot from phone
curl -s -X POST "$LUNA/api/luna/bots" \
  -H "Content-Type: application/json" \
  -d '{"name":"PHONE-BOT","coinPair":"BTC/USDT"}' | jq

# Chat with LUNA
curl -s -X POST "$LUNA/api/luna/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the active signals?"}' | jq '.lunaResponse.content'

# Admin reset all bots
curl -s -X POST "$LUNA/api/admin" \
  -H "X-Luna-Key: $KEY" \
  -H "Content-Type: application/json" \
  -d '{"command":"reset_bots"}' | jq
```

---

## 📲 Install as Phone App (PWA)

**Android (Chrome):** Open → ⋮ → "Add to Home Screen"
**iOS (Safari):** Open → Share → "Add to Home Screen"
Works **offline** — pages and API responses are cached.

---

## 📄 Pages (20+)

| Route | Description |
|---|---|
| `/` | Command Center — 12 V1–V12 tiles, health, activity feed |
| `/crypto-signals` | Live RSI/MACD/volume alerts |
| `/bot-engine` | Create & manage bots, sim→live toggle |
| `/dca-bot` | DCA Bot — safety order calculator |
| `/signal-bot` | Signal Bot — webhook + TradingView integration |
| `/grid-bot` | Grid Bot — range-bound trading |
| `/smarttrade` | Manual trading with trailing TP/SL |
| `/bot-performance` | PnL, drawdown, radar, trade frequency charts |
| `/strategy-builder` | Build, backtest, assign strategies |
| `/economy-dashboard` | MRR, revenue, PnL, tier analytics |
| `/portfolio` | Multi-exchange assets + rebalancing |
| `/chat-console` | LUNA Chat → layer agent routing |
| `/v7-monetization` | Signal → Classify → Score → Package |
| `/v8-company-factory` | AI company generation |
| `/v12-ecosystem` | Force-directed ecosystem graph |
| `/admin-terminal` | **Termux API console** |
| `/api-docs` | Full REST API reference + curl examples |

---

## 🔌 REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET/POST | `/api/luna/system` | System status |
| GET/POST | `/api/luna/bots` | List / create bots |
| GET/PATCH/DELETE | `/api/luna/bots/:id` | Manage bot |
| GET/POST/DELETE | `/api/luna/signals` | Signals |
| GET/POST/PUT/DELETE | `/api/luna/strategies` | Strategies |
| GET/POST | `/api/luna/portfolio` | Portfolio |
| POST | `/api/luna/chat` | Chat with LUNA |
| GET/POST | `/api/admin` | Admin (X-Luna-Key required) |

---

## 🎨 Design

```
Background:  #050810  (deep space black)
Cyan:        #00F5FF  (primary accent)
Violet:      #9B5DE5  (secondary)
Magenta:     #FF006E  (alerts)
Green:       #00FF88  (active/success)
Amber:       #FFB700  (live mode)
```

## 🛠️ Stack

Next.js 16 · TypeScript · Recharts · Drizzle ORM · Tailwind CSS 4 · PWA

---

*Built with LUNA AI — V1-V12 Architecture*

## Features

- **Standardized Utilities**: Prediction-first wrappers for `fetch`, `env` validation, and a leveled `logger`.
- **Database Ready**: Drizzle ORM + PostgreSQL initialization pre-configured.
- **UI System**: Tailwind CSS 4, the full Radix UI primitive set (shadcn-style components under `components/ui/`), and `sonner` for notifications.
- **Forms**: React Hook Form + Zod resolvers.
- **AI-Friendly**: Ships with `docs/AI_GUIDE.md` to keep AI-generated code consistent.

## Tech Stack

- Next.js 16 (App Router)
- React 19 / TypeScript 5
- Tailwind CSS 4
- Drizzle ORM + PostgreSQL (`postgres` driver)
- Zod + React Hook Form
- Zustand (state management)
- Vercel Analytics + optional Umami script injection

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment variables**:
   Copy `.env.example` to `.env` and configure at minimum `DATABASE_URL`. Umami analytics variables (`NEXT_PUBLIC_UMAMI_SCRIPT_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`) are optional and only injected in production.

3. **Run development server** (port 13000):
   ```bash
   pnpm dev
   ```

4. **Database commands**:
   - `pnpm db:generate` — generate migrations
   - `pnpm db:migrate` — run migrations
   - `pnpm db:studio` — open Drizzle Studio

## Project Structure

- `app/` — Next.js App Router (`layout.tsx`, `page.tsx`, `api/`).
- `components/` — `AgentationGuard.tsx` plus shadcn-style primitives in `components/ui/`.
- `db/` — Drizzle client (`db/index.ts`).
- `lib/` — Core utilities: `request.ts`, `env.ts`, `logger.ts`, `errors.ts`, `utils.ts`, `agentationFeedbackMode.ts`.
- `hooks/` — Shared hooks (`use-mobile.ts`, `use-toast.ts`).
- `utils/` — `cn.ts` (clsx + tailwind-merge).
- `docs/` — `AI_GUIDE.md` (AI/developer conventions).
- `Dockerfile` — Multi-stage node:22-slim build exposing port 13000.
