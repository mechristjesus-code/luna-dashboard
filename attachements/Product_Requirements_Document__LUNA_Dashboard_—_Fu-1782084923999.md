# Product Requirements Document: LUNA Dashboard — Full System (V1–V12) + Crypto & Bot Engine

## 1. Introduction

This document outlines the product requirements for the LUNA Dashboard, a sophisticated AI command center designed for a solo operator. It integrates a comprehensive AI architecture (V1-V12) with advanced crypto intelligence and trading bot capabilities. The goal is to provide unparalleled visibility, control, and automation over AI agents, a simulated economy, SaaS ecosystem generation, and both live and paper crypto trading, all presented through an immersive sci-fi holographic interface.

## 2. Vision

To empower a solo operator with a unified, intelligent, and highly automated platform for managing complex AI ecosystems and engaging in advanced crypto trading. The LUNA Dashboard aims to be the ultimate control center, simplifying intricate operations through an intuitive, futuristic interface and enabling strategic decision-making and autonomous execution across multiple domains.

## 3. Scope

### 3.1. In-Scope

*   **LUNA Architecture Integration (V1-V12)**: Full coverage of Cognition, Agent, Economy, SaaS Ecosystem, and Autonomous Ecosystem layers.
*   **Crypto Intelligence Module**: Real-time market signal monitoring, technical indicators, and custom alerts.
*   **Crypto Trading Bot Engine**: Automated strategy execution in simulation mode with a toggle for live trading.
*   **Operator Interface**: Immersive sci-fi holographic UI for full visibility, control, and automation.
*   **Core Flows**: As detailed in Section 5.
*   **Authentication**: Secure login for the single operator.

### 3.2. Out-of-Scope

*   Multi-user logic or permission tiers.
*   Direct integration with multiple external crypto exchanges beyond the initial live toggle scaffold.
*   Public API for external access to LUNA Dashboard functionalities.
*   Mobile native applications (focus is on a web-based dashboard).

## 4. Audience & Roles

**Primary User**: Single operator (solo user).

**Role**: The operator has full administrative access to all modules, including crypto signals, bot configuration, and the ability to toggle between simulation and live modes for trading. No multi-user logic or permission tiers are required, simplifying the access model to a single, authenticated administrator.

## 5. Core Flows

These flows represent critical user journeys and functionalities that must be fully implemented and tested end-to-end:

1.  **Operator Login & Command Center View**: Upon successful authentication, the operator lands on the LUNA Command Center. This central hub displays animated status tiles for each LUNA layer (V1–V12), a global system health score, active bot count, active signals, total simulated revenue, and a real-time, scrolling Activity Feed.
2.  **LUNA Chat Console Interaction**: The operator accesses the LUNA Chat Console to input natural-language commands. These commands are intelligently routed to the appropriate layer agent (Cognition, Trading, Factory, Deployment, Ecosystem, or Crypto Bot), which processes the request and returns a structured response. All interactions are logged to the Activity Feed with a relevant layer tag.
3.  **Crypto Signal Monitor & Alerting**: The operator opens the Crypto Signal Monitor to view a live-updating feed of market signals for various cryptocurrencies (e.g., RSI, volume spike, MACD crossover, price momentum). Custom alert thresholds can be set per coin and indicator. When a threshold is met, an alert appears in the Activity Feed and the signal panel, color-coded by severity (cyan for informational, magenta for critical).
4.  **Bot Engine Management**: The Bot Engine panel provides an overview of all configured trading bots, displaying their status (running/paused/stopped), mode (simulation/live), assigned strategy, and performance metrics. Operators can create new bots by selecting a coin pair, strategy, entry/exit rules, position size, and stop-loss. Saved bots are activated in simulation mode by default, allowing real-time monitoring of paper trade results (virtual balance, trade log, PnL chart).
5.  **Simulation to Live Mode Toggle**: The operator can switch a bot from simulation to live mode. This action triggers a warning modal requiring confirmation, emphasizing the irreversible nature and real financial risks involved. Upon confirmation, the bot transitions to live execution, with all live trade actions meticulously logged to the Activity Feed, marked with a `[LIVE]` tag.
6.  **Strategy Builder (V6 Extended)**: This module allows operators to create sophisticated trading strategies. Users define signal conditions (e.g., RSI < 30 + volume spike), portfolio allocation rules, entry/exit triggers, and risk parameters. Strategies can be saved, run through simulation backtests, and reviewed for performance metrics such as PnL curve, win rate, max drawdown, and trade count. Approved strategies can then be assigned to one or more trading bots.
7.  **Bot Performance Dashboard**: A dedicated dashboard provides aggregate PnL across all bots (separated by simulation vs. live performance), win/loss ratio, identification of the best-performing strategy, total trades executed, and a detailed per-bot breakdown, all visualized using Recharts.
8.  **Monetization Engine (V7)**: The operator uses this engine to classify identified market signals as monetizable opportunities, which are then converted into entries for the Company Factory.
9.  **Company Factory (V8)**: This module facilitates the creation of AI companies. It automates the generation of service registry entries and displays a simulated revenue card for each new company.
10. **Deployment & Gateway (V9)**: Operators manage deployed services, API keys, and monitor usage metrics through this interface.
11. **SaaS Marketplace (V10)**: This section allows for the management of subscription tiers and provides insights into simulated Monthly Recurring Revenue (MRR) and usage analytics.
12. **Global Deployment Stack (V11)**: A checklist-based interface for reviewing the production-readiness of each company.
13. **Ecosystem Engine (V12)**: Visualizes the entire ecosystem of AI companies, services, and agents as a force-directed node graph with glowing edges. Operators can trigger autonomous expansion and view dynamic pricing intelligence and orchestration logs.
14. **Economy Simulation Dashboard**: Provides an aggregate view of simulated revenue, PnL over time, subscription revenue by tier, top-performing services, and the virtual profit contribution from bot-generated activities.

## 6. Design Preferences

### 6.1. Aesthetic & Theme

**Sci-fi holographic aesthetic** with full dark immersion. The overall theme is futuristic, clean, and highly functional, reminiscent of advanced command interfaces.

### 6.2. Color Palette

*   **Background**: Deep space black (`#050810`)
*   **Panel Surfaces**: Dark navy (`#0D1526`) with 1px neon-glow borders.
*   **Primary Accent**: Electric cyan (`#00F5FF`)
*   **Secondary Accent**: Violet (`#9B5DE5`)
*   **Alert/Critical**: Magenta (`#FF006E`)
*   **Active/Success**: Neon green (`#00FF88`)
*   **Live Mode Indicator**: Pulsing amber (`#FFB700`)

### 6.3. Typography

*   **Data, Logs, Signal Feeds**: `JetBrains Mono` (monospace for readability of technical information).
*   **Headings & Labels**: `Inter Tight condensed` (for a modern, compact look).

### 6.4. Visual Elements & Motion

*   All panels feature a subtle neon box-shadow glow.
*   Animated pulse dots indicate live bots and active signals, providing immediate visual feedback.
*   **Recharts Graphs**: Utilize neon cyan lines, violet area fills, and a dark grid for consistency with the overall theme.
*   **Navigation**: A persistent left sidebar, logically grouped by LUNA layers (Cognition V1–V3, Agent V4–V6, Economy V7–V9, SaaS V10–V11, Ecosystem V12). Crypto Signals, Bot Engine, Bot Performance, Chat Console, and Activity Feed are prominently pinned at the top for quick access.
*   **Bot Indicators**: Simulation mode bots are identified by a cyan badge; live mode bots feature a pulsing amber `[LIVE]` badge.
*   **Ecosystem Node Graph**: Implemented using a force-directed SVG layout with glowing edges to visually represent connections and interactions.
*   **Motion**: Emphasize glowing pulses on live data, smooth panel slide-ins, and avoid chaotic or distracting animations to maintain a focused user experience.

## 7. Technical Requirements

### 7.1. Data Model & Entities

The system will manage the following key entities, with their primary attributes:

*   **Agent**: `name`, `version`, `layer`, `status`, `last_command`, `last_output`, `agent_type`.
*   **MemoryEntry**: `key`, `value`, `layer`, `created_date`.
*   **ToolExecution**: `tool_name`, `input`, `output`, `status`, `duration_ms`, `timestamp`.
*   **TradingStrategy**: `name`, `signal_conditions`, `portfolio_rules`, `execution_logic`, `risk_params`, `status` (`[draft|active|archived]`), `simulation_results` (`[pnl_curve, win_rate, drawdown, trade_count]`), `created_date`.
*   **ActivityLog**: `event_type`, `layer`, `message`, `severity` (`[info|warn|error|critical|live]`), `timestamp`.
*   **ChatMessage**: `role` (`[user|luna]`), `content`, `layer_target`, `timestamp`.
*   **MonetizationSignal**: `signal_type`, `description`, `classification`, `status`, `created_date`.
*   **Company**: `name`, `company_type`, `services`, `status`, `simulated_revenue`, `created_date`.
*   **Service**: `name`, `company_id`, `api_key`, `status`, `usage_count`, `tier`.
*   **DeploymentChecklist**: `company_id`, `auth_ready`, `db_ready`, `billing_ready`, `cicd_ready`, `cloud_ready`, `production_score`.
*   **SubscriptionTier**: `service_id`, `tier_name`, `price_simulated`, `user_count_simulated`.
*   **EcosystemEvent**: `event_type`, `company_id`, `description`, `timestamp`.
*   **CryptoSignal**: `coin_pair`, `indicator` (`[RSI|MACD|volume_spike|momentum]`), `value`, `threshold`, `triggered`, `severity`, `timestamp`.
*   **AlertRule**: `coin_pair`, `indicator`, `threshold`, `condition` (`[above|below]`), `active`.
*   **TradingBot**: `name`, `coin_pair`, `strategy_id`, `mode` (`[simulation|live]`), `status` (`[running|paused|stopped]`), `virtual_balance`, `total_pnl`, `trade_count`, `created_date`.
*   **BotTrade**: `bot_id`, `type` (`[buy|sell]`), `coin_pair`, `price`, `quantity`, `pnl`, `mode`, `timestamp`.

### 7.2. Backend Logic & Integrations

*   **Crypto Signal Data**: Simulated via backend functions designed to generate realistic indicator values on a scheduled basis, ensuring a dynamic and testable environment without immediate reliance on live market data.
*   **Bot Execution Logic**: Core logic runs within backend functions. Simulation mode will accurately calculate virtual balance and PnL. The scaffold for live mode will be present, with a clear integration hook for future connection to real exchange APIs. The UI toggle for live mode will be functional, and the backend function will be stubbed out for future development.
*   **Charting**: All charts and data visualizations will be rendered using `Recharts` for a consistent and high-quality presentation.
*   **Ecosystem Graph**: The force-directed SVG layout will be used for the ecosystem graph, ensuring dynamic and interactive visualization of AI companies and their interconnections.

## 8. Future Considerations

*   Integration with external crypto exchanges for live trading beyond the initial scaffold.
*   Development of a mobile companion application for on-the-go monitoring.
*   Implementation of advanced AI-driven predictive analytics for market signals.
*   Expansion of the LUNA architecture with new layers or enhanced capabilities.

## 9. Glossary

*   **LUNA Architecture**: The overarching AI system comprising 12 versions (V1-V12) across five layers: Cognition, Agent, Economy, SaaS Ecosystem, and Autonomous Ecosystem.
*   **Crypto Intelligence Module**: Component responsible for monitoring and analyzing cryptocurrency market data.
*   **Crypto Trading Bot Engine**: System for creating, managing, and executing automated cryptocurrency trading strategies.
*   **Simulation Mode**: Trading bot operation using virtual funds and market data, without real financial risk.
*   **Live Mode**: Trading bot operation using real funds and live market data, involving actual financial transactions.
*   **RSI (Relative Strength Index)**: A momentum indicator used in technical analysis.
*   **MACD (Moving Average Convergence Divergence)**: A trend-following momentum indicator that shows the relationship between two moving averages of a security’s price.
*   **PnL (Profit and Loss)**: A financial statement that summarizes the revenues, costs, and expenses incurred during a specified period.
*   **MRR (Monthly Recurring Revenue)**: A predictable revenue stream that a business can expect to receive every month.
*   **Force-directed Graph**: A type of graph drawing algorithm that simulates physical forces to arrange nodes and edges, often used for network visualization.

---

**Author**: Manus AI
**Date**: June 21, 2026
