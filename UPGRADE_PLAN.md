# LUNA Dashboard Bot Suite Upgrade Plan

Based on the audit of the `luna-dashboard` repository, here is the comprehensive plan to upgrade and enhance the bot suite.

## 1. Backend Bot Upgrades and New Features (Phase 3)

The current system relies heavily on simulated data in `lib/luna/data.ts` and `lib/luna/store.ts`. We will enhance the core bot capabilities:

- **Advanced Trading Logic for DCA & Grid Bots:** 
  - Enhance the DCA bot model to support composite start conditions (e.g., RSI + MACD + Volume).
  - Add dynamic grid spacing for the Grid bot based on ATR (Average True Range) volatility.
- **New Bot Type - Arbitrage Bot:**
  - Introduce an Arbitrage Bot model that monitors price differences across simulated exchanges (e.g., Binance vs. Coinbase).
- **Enhanced Signal Processing:**
  - Upgrade the `CryptoSignal` model to include AI-driven sentiment analysis scores.
  - Implement a webhook ingestion endpoint in `app/api/luna/signals/route.ts` to simulate receiving external TradingView webhooks.
- **State Persistence Improvements:**
  - Move from purely in-memory `store.ts` to utilizing the existing PostgreSQL database schema (`db/schema.ts`) for bots, trades, and signals, enabling true persistence across restarts.

## 2. Dashboard UI/UX Improvements (Phase 4)

The UI is built with Next.js App Router, Tailwind CSS, and custom Neon components. We will elevate the visual experience:

- **Bot Engine Dashboard Refamp:**
  - Update `app/bot-engine/page.tsx` with real-time WebSocket-simulated updates (using interval polling or SSE) instead of static renders.
  - Add a unified "Master Control" panel to pause/start all bots simultaneously.
- **Enhanced Charting:**
  - Upgrade the Recharts implementations in `bot-performance` and `smarttrade` to include interactive tooltips, zoom capabilities, and multi-axis comparisons (e.g., Price vs. Volume).
- **New Analytics Views:**
  - Add a "Risk Heatmap" component showing portfolio exposure across different bot strategies.
- **Responsive Design Fixes:**
  - Ensure all `NeonCard` grids collapse gracefully on mobile devices (using Tailwind grid classes).

## 3. Integrations, Performance, and Code Modernization (Phase 5)

- **Database Integration:**
  - Wire up Drizzle ORM (`db/index.ts`) to actual API routes, replacing the mock `store.ts` arrays for `tradingBots`, `botTrades`, and `cryptoSignals`.
- **API Security:**
  - Implement basic API key validation middleware for all `/api/luna/*` routes.
- **Code Modernization:**
  - Refactor large components (like `app/smarttrade/page.tsx`) into smaller, reusable sub-components.
  - Ensure strict TypeScript typing across all API responses.
- **Performance:**
  - Add Next.js caching and revalidation tags where appropriate.
  - Optimize font loading and bundle size.

## Execution Strategy

I will proceed phase by phase, starting with the backend logic and database wiring, followed by the UI enhancements, and concluding with performance tuning and testing.
