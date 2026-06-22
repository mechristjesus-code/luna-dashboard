"use client";
// LUNA simulated data generators — client-side seed data & helpers
// UPGRADED: v2.0 — Arbitrage Bot, enhanced DCA/Grid/Signal, AI sentiment, composite conditions

export type LayerStatus = 'online' | 'processing' | 'idle' | 'error';
export type SignalSeverity = 'info' | 'warn' | 'critical';
export type BotMode = 'simulation' | 'live';
export type BotStatus = 'running' | 'paused' | 'stopped';

export interface LunaLayer {
  id: string;
  version: string;
  name: string;
  group: string;
  status: LayerStatus;
  description: string;
  icon: string;
}

export interface ActivityLogEntry {
  id: string;
  eventType: string;
  layer: string;
  message: string;
  severity: 'info' | 'warn' | 'error' | 'critical' | 'live';
  timestamp: Date;
}

export interface CryptoSignal {
  id: string;
  coinPair: string;
  indicator: 'RSI' | 'MACD' | 'volume_spike' | 'momentum' | 'sentiment' | 'whale_alert' | 'liquidation';
  value: number;
  threshold: number;
  triggered: boolean;
  severity: SignalSeverity;
  timestamp: Date;
  // NEW: AI sentiment enrichment
  sentimentScore?: number;    // -1 to +1 (negative = bearish, positive = bullish)
  sentimentLabel?: 'Bullish' | 'Bearish' | 'Neutral';
  source?: 'LUNA' | 'TradingView' | 'Webhook' | 'On-Chain';
  confidence?: number;        // 0–100%
}

export interface TradingBot {
  id: string;
  name: string;
  coinPair: string;
  strategy: string;
  mode: BotMode;
  status: BotStatus;
  virtualBalance: number;
  totalPnl: number;
  tradeCount: number;
  winRate?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  pnlHistory: { time: string; pnl: number }[];
}

export interface TradingStrategy {
  id: string;
  name: string;
  signalConditions: string;
  status: 'draft' | 'active' | 'archived';
  winRate: number;
  maxDrawdown: number;
  tradeCount: number;
  pnlCurve: { time: string; pnl: number }[];
  // NEW: composite condition fields
  entryConditions?: StrategyCondition[];
  exitConditions?: StrategyCondition[];
  riskLevel?: 'Low' | 'Medium' | 'High';
  timeframe?: string;
  backtestPeriod?: string;
  sharpeRatio?: number;
}

export interface StrategyCondition {
  indicator: string;
  operator: '<' | '>' | 'crosses_above' | 'crosses_below' | '==' | 'spike';
  value: number | string;
  weight: number;  // 0–1, contribution to composite score
}

// ── 3Commas-inspired Bot Types ─────────────────────────────────────

/** DCA Safety Order — represents one averaging level */
export interface SafetyOrder {
  index: number;
  deviationPct: number;       // cumulative % drop from base price
  price: number;              // absolute price at this level
  orderSize: number;          // USDT to invest at this level
  cumulativeVolume: number;   // total invested so far
  avgPrice: number;           // average entry price after this fill
  filled: boolean;
}

export interface BotFund {
  botId: string;
  currency: string;           // e.g., "USDT", "BTC", "ETH"
  balance: number;            // available balance
  reserved: number;           // locked in active trades
  totalDeposited: number;     // cumulative deposits
  totalWithdrawn: number;     // cumulative withdrawals
  createdAt: Date;
  lastUpdated: Date;
}

export interface DCABot {
  id: string;
  name: string;
  coinPair: string;
  exchange: string;
  mode: 'simulation' | 'live';
  status: 'running' | 'paused' | 'stopped';
  // NEW: Dedicated Bot Fund
  fund: BotFund;              // bot's own trading fund
  // Order config
  baseOrderSize: number;      // USDT
  safetyOrderSize: number;    // USDT (first SO)
  maxSafetyOrders: number;
  deviationStep: number;      // % drop to first SO
  deviationStepMultiplier: number;
  safetyOrderSizeMultiplier: number;
  // TP/SL
  takeProfit: number;         // %
  stopLoss: number;           // %
  stopLossTimeout: number;    // seconds
  trailingTP: number;         // % (0 = disabled)
  reinvestProfit: number;     // % (100 = full reinvest)
  // Start condition (ENHANCED: composite conditions)
  startCondition: 'immediately' | 'rsi_oversold' | 'signal' | 'composite';
  rsiPeriod: number;
  rsiTimeframe: string;
  rsiThreshold: number;
  // NEW: composite start conditions
  macdEnabled?: boolean;
  macdSignalThreshold?: number;
  volumeMultiplierEnabled?: boolean;
  volumeMultiplierThreshold?: number;
  compositeScore?: number;    // 0–100 — how many conditions are met
  // Trade mgmt
  autoCloseDuration: number;  // hours
  cooldownSec: number;
  maxActiveTrades: number;
  // Current state
  totalBalance: number;
  maxBotUsage: number;        // USDT
  currentAvgPrice: number;
  totalPnl: number;
  tradeCount: number;
  winRate?: number;
  filledSafetyOrders: number;
  safetyOrders: SafetyOrder[];
  pnlHistory: { time: string; pnl: number }[];
  // NEW: ATR-based dynamic deviation
  atrEnabled?: boolean;
  atrPeriod?: number;
  atrMultiplier?: number;
}

export interface GridBot {
  id: string;
  name: string;
  coinPair: string;
  exchange: string;
  mode: 'simulation' | 'live';
  status: 'running' | 'paused' | 'stopped';
  // NEW: Dedicated Bot Fund
  fund: BotFund;              // bot's own trading fund
  // Grid config
  upperPrice: number;
  lowerPrice: number;
  gridLines: number;
  investmentAmount: number;   // USDT total
  gridSpacing: number;        // % between lines
  // NEW: dynamic grid options
  gridType?: 'arithmetic' | 'geometric';
  autoRebalance?: boolean;
  atrEnabled?: boolean;
  atrPeriod?: number;
  // Performance
  totalPnl: number;
  gridProfit: number;
  openOrders: number;
  filledOrders: number;
  profitPerGrid?: number;
  annualizedReturn?: number;
  pnlHistory: { time: string; pnl: number }[];
}

export interface SignalBot {
  id: string;
  name: string;
  coinPair: string;
  exchange: string;
  mode: 'simulation' | 'live';
  status: 'running' | 'paused' | 'stopped';
  // NEW: Dedicated Bot Fund
  fund: BotFund;              // bot's own trading fund
  // Webhook
  webhookUrl: string;
  signalSource: 'TradingView' | 'Custom' | 'LUNA';
  // Volume control
  maxInvestmentPct: number;   // 0-100%
  volumePerEntryPct: number;  // % of total investment per entry
  volumePerExitPct: number;   // % of position per exit
  // Signal filters
  priceDeviationEntry: number;  // % min deviation from last order
  priceDeviationExit: number;   // % min deviation from avg price
  // TP/SL
  takeProfit: number;         // %
  stopLoss: number;           // %
  // NEW: advanced signal filtering
  minConfidence?: number;     // 0–100 — minimum signal confidence to execute
  sentimentFilter?: 'bullish_only' | 'bearish_only' | 'any';
  cooldownAfterSL?: number;   // seconds to wait after stop-loss hit
  // Performance
  totalPnl: number;
  tradeCount: number;
  signalsReceived: number;
  signalsExecuted: number;
  signalsFiltered?: number;   // signals rejected by filters
  lastSignalTime: Date | null;
  pnlHistory: { time: string; pnl: number }[];
}

// ── NEW: Arbitrage Bot ─────────────────────────────────────────────
export interface ArbitrageOpportunity {
  id: string;
  coinPair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPct: number;
  estimatedProfit: number;    // USDT after fees
  status: 'detected' | 'executing' | 'completed' | 'missed';
  detectedAt: Date;
}

export interface ArbitrageBot {
  id: string;
  name: string;
  coinPairs: string[];        // pairs to monitor
  exchanges: string[];        // exchanges to compare
  mode: 'simulation' | 'live';
  status: 'running' | 'paused' | 'stopped';
  // NEW: Dedicated Bot Fund
  fund: BotFund;              // bot's own trading fund
  // Config
  minSpreadPct: number;       // minimum spread % to trigger
  maxInvestmentPerTrade: number; // USDT
  feePerSide: number;         // % exchange fee per side
  executionDelayMs: number;   // simulated execution delay
  // Risk
  maxDailyTrades: number;
  maxDailyLoss: number;       // USDT
  // Performance
  totalPnl: number;
  tradeCount: number;
  opportunitiesDetected: number;
  opportunitiesExecuted: number;
  avgSpreadCapture: number;   // % average spread captured
  winRate: number;
  pnlHistory: { time: string; pnl: number }[];
  recentOpportunities: ArbitrageOpportunity[];
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  allocation: number;         // % of total portfolio
  targetAllocation: number;   // desired %
  drift: number;              // allocation - targetAllocation
  change24h: number;          // % price change 24h
  // NEW: risk metrics
  volatility30d?: number;     // % 30-day volatility
  beta?: number;              // correlation to BTC
  riskScore?: number;         // 0–100
}

export interface ExchangeConnection {
  id: string;
  name: string;
  type: 'Binance' | 'Bybit' | 'OKX' | 'KuCoin' | 'Kraken' | 'Coinbase' | 'Gate.io';
  mode: 'real' | 'demo';
  status: 'connected' | 'disconnected' | 'error';
  totalBalance: number;
  apiKeyMasked: string;
  lastSync: Date;
}

export interface SmartTrade {
  id: string;
  coinPair: string;
  exchange: string;
  direction: 'long' | 'short';
  status: 'open' | 'closed' | 'cancelled';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  takeProfitPct: number;
  stopLossPct: number;
  trailingStopPct: number;    // 0 = disabled
  trailingTPPct: number;      // 0 = disabled
  unrealizedPnl: number;
  realizedPnl: number;
  openedAt: Date;
  // NEW: leverage & margin
  leverage?: number;
  marginType?: 'isolated' | 'cross';
  liquidationPrice?: number;
}

// ── LUNA Layers ────────────────────────────────────────────────────
export const LUNA_LAYERS: LunaLayer[] = [
  { id: 'v1', version: 'V1', name: 'Signal Ingestion', group: 'Cognition', status: 'online', description: 'Raw market data intake & normalization', icon: '◈' },
  { id: 'v2', version: 'V2', name: 'Pattern Recognition', group: 'Cognition', status: 'online', description: 'Technical pattern & anomaly detection', icon: '◈' },
  { id: 'v3', version: 'V3', name: 'Memory & Context', group: 'Cognition', status: 'processing', description: 'Long-term memory & context persistence', icon: '◈' },
  { id: 'v4', version: 'V4', name: 'Strategy Engine', group: 'Agent', status: 'online', description: 'Autonomous strategy formulation', icon: '◆' },
  { id: 'v5', version: 'V5', name: 'Execution Agent', group: 'Agent', status: 'online', description: 'Trade execution & order management', icon: '◆' },
  { id: 'v6', version: 'V6', name: 'Risk Controller', group: 'Agent', status: 'idle', description: 'Real-time risk & exposure management', icon: '◆' },
  { id: 'v7', version: 'V7', name: 'Monetization Engine', group: 'Economy', status: 'processing', description: 'Signal-to-revenue transformation pipeline', icon: '⬡' },
  { id: 'v8', version: 'V8', name: 'Company Factory', group: 'Economy', status: 'online', description: 'AI company generation & registry', icon: '⬡' },
  { id: 'v9', version: 'V9', name: 'Deployment Gateway', group: 'Economy', status: 'online', description: 'Service deployment & API key issuance', icon: '⬡' },
  { id: 'v10', version: 'V10', name: 'SaaS Marketplace', group: 'SaaS', status: 'online', description: 'Subscription tier & MRR management', icon: '▲' },
  { id: 'v11', version: 'V11', name: 'Global Stack', group: 'SaaS', status: 'idle', description: 'Production readiness & deployment checklist', icon: '▲' },
  { id: 'v12', version: 'V12', name: 'Ecosystem Engine', group: 'Ecosystem', status: 'processing', description: 'Force-directed ecosystem visualization & expansion', icon: '✦' },
];

// ── Seed Activity Logs ─────────────────────────────────────────────
export const SEED_ACTIVITY: ActivityLogEntry[] = [
  { id: '1', eventType: 'SIGNAL', layer: 'V2', message: 'RSI alert triggered on BTC/USDT — value: 28.4 (threshold: 30) · Sentiment: Bullish 78%', severity: 'critical', timestamp: new Date(Date.now() - 12000) },
  { id: '2', eventType: 'BOT', layer: 'V5', message: 'Bot ALPHA-1 executed BUY 0.05 BTC @ $67,240 [SIM] · Composite score: 92/100', severity: 'info', timestamp: new Date(Date.now() - 28000) },
  { id: '3', eventType: 'ARBITRAGE', layer: 'V5', message: 'ARB-BOT-1 detected BTC spread: Binance $67,240 vs Bybit $67,318 (+0.12%) · Est. profit: $3.80', severity: 'live', timestamp: new Date(Date.now() - 35000) },
  { id: '4', eventType: 'MONETIZE', layer: 'V7', message: 'Signal classified as SaaS opportunity — alpha score: 87', severity: 'info', timestamp: new Date(Date.now() - 45000) },
  { id: '5', eventType: 'COMPANY', layer: 'V8', message: 'New company blueprint generated: "CryptoSignal Pro API"', severity: 'info', timestamp: new Date(Date.now() - 72000) },
  { id: '6', eventType: 'VOLUME', layer: 'V1', message: 'ETH/USDT volume spike detected — 340% above 24h average · Whale alert: 12,400 ETH moved', severity: 'warn', timestamp: new Date(Date.now() - 95000) },
  { id: '7', eventType: 'STRATEGY', layer: 'V4', message: 'Strategy "RSI Reversal v2" backtest complete — Win rate: 68% · Sharpe: 1.84', severity: 'info', timestamp: new Date(Date.now() - 130000) },
  { id: '8', eventType: 'DEPLOY', layer: 'V9', message: 'API key issued for service "momentum-scanner-v1"', severity: 'info', timestamp: new Date(Date.now() - 210000) },
  { id: '9', eventType: 'RISK', layer: 'V6', message: 'Portfolio risk score elevated to 72/100 — BTC allocation drift +4.2%', severity: 'warn', timestamp: new Date(Date.now() - 280000) },
  { id: '10', eventType: 'ECOSYSTEM', layer: 'V12', message: 'Autonomous expansion triggered — 3 new service nodes spawned', severity: 'warn', timestamp: new Date(Date.now() - 360000) },
];

// ── Seed Crypto Signals ────────────────────────────────────────────
export const SEED_SIGNALS: CryptoSignal[] = [
  { id: 's1', coinPair: 'BTC/USDT', indicator: 'RSI', value: 28.4, threshold: 30, triggered: true, severity: 'critical', timestamp: new Date(Date.now() - 12000), sentimentScore: 0.72, sentimentLabel: 'Bullish', source: 'LUNA', confidence: 91 },
  { id: 's2', coinPair: 'ETH/USDT', indicator: 'volume_spike', value: 3.4, threshold: 2.0, triggered: true, severity: 'warn', timestamp: new Date(Date.now() - 95000), sentimentScore: 0.41, sentimentLabel: 'Bullish', source: 'On-Chain', confidence: 74 },
  { id: 's3', coinPair: 'SOL/USDT', indicator: 'MACD', value: 0.82, threshold: 0.5, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 180000), sentimentScore: 0.18, sentimentLabel: 'Neutral', source: 'TradingView', confidence: 62 },
  { id: 's4', coinPair: 'BNB/USDT', indicator: 'momentum', value: 72.1, threshold: 65, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 240000), sentimentScore: 0.55, sentimentLabel: 'Bullish', source: 'LUNA', confidence: 80 },
  { id: 's5', coinPair: 'ARB/USDT', indicator: 'RSI', value: 71.8, threshold: 70, triggered: true, severity: 'warn', timestamp: new Date(Date.now() - 300000), sentimentScore: -0.22, sentimentLabel: 'Bearish', source: 'TradingView', confidence: 68 },
  { id: 's6', coinPair: 'AVAX/USDT', indicator: 'MACD', value: -0.34, threshold: -0.5, triggered: false, severity: 'info', timestamp: new Date(Date.now() - 420000), sentimentScore: -0.08, sentimentLabel: 'Neutral', source: 'LUNA', confidence: 45 },
  { id: 's7', coinPair: 'BTC/USDT', indicator: 'sentiment', value: 78, threshold: 70, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 540000), sentimentScore: 0.78, sentimentLabel: 'Bullish', source: 'On-Chain', confidence: 85 },
  { id: 's8', coinPair: 'DOGE/USDT', indicator: 'volume_spike', value: 4.7, threshold: 2.0, triggered: true, severity: 'critical', timestamp: new Date(Date.now() - 720000), sentimentScore: 0.61, sentimentLabel: 'Bullish', source: 'On-Chain', confidence: 77 },
  { id: 's9', coinPair: 'BTC/USDT', indicator: 'whale_alert', value: 12400, threshold: 5000, triggered: true, severity: 'warn', timestamp: new Date(Date.now() - 900000), sentimentScore: 0.35, sentimentLabel: 'Bullish', source: 'On-Chain', confidence: 88 },
  { id: 's10', coinPair: 'ETH/USDT', indicator: 'liquidation', value: 4200000, threshold: 1000000, triggered: true, severity: 'critical', timestamp: new Date(Date.now() - 1200000), sentimentScore: -0.65, sentimentLabel: 'Bearish', source: 'On-Chain', confidence: 95 },
];

// ── Seed Bots ──────────────────────────────────────────────────────
const makePnlHistory = (base: number, steps = 24) =>
  Array.from({ length: steps }, (_, i) => ({
    time: `${i}h`,
    pnl: parseFloat((base + (Math.random() - 0.44) * 200 * ((i + 1) / steps)).toFixed(2)),
  }));

export const SEED_BOTS: TradingBot[] = [
  { id: 'b1', name: 'ALPHA-1', coinPair: 'BTC/USDT', strategy: 'RSI Reversal v2', mode: 'simulation', status: 'running', virtualBalance: 11240, totalPnl: 1240, tradeCount: 47, winRate: 68, maxDrawdown: 8.4, sharpeRatio: 1.84, pnlHistory: makePnlHistory(0) },
  { id: 'b2', name: 'BETA-X', coinPair: 'ETH/USDT', strategy: 'MACD Crossover', mode: 'simulation', status: 'running', virtualBalance: 9820, totalPnl: -180, tradeCount: 33, winRate: 48, maxDrawdown: 14.2, sharpeRatio: 0.62, pnlHistory: makePnlHistory(-100) },
  { id: 'b3', name: 'GAMMA-3', coinPair: 'SOL/USDT', strategy: 'Volume Breakout', mode: 'live', status: 'running', virtualBalance: 15600, totalPnl: 5600, tradeCount: 89, winRate: 74, maxDrawdown: 6.2, sharpeRatio: 2.41, pnlHistory: makePnlHistory(300) },
  { id: 'b4', name: 'DELTA-9', coinPair: 'ARB/USDT', strategy: 'Momentum Surf', mode: 'simulation', status: 'paused', virtualBalance: 9950, totalPnl: -50, tradeCount: 12, winRate: 55, maxDrawdown: 15.8, sharpeRatio: 0.88, pnlHistory: makePnlHistory(-50) },
  { id: 'b5', name: 'OMEGA-7', coinPair: 'BNB/USDT', strategy: 'Composite AI', mode: 'simulation', status: 'running', virtualBalance: 12800, totalPnl: 2800, tradeCount: 64, winRate: 71, maxDrawdown: 7.1, sharpeRatio: 2.12, pnlHistory: makePnlHistory(150) },
];

// ── Seed Strategies ────────────────────────────────────────────────
const makePnlCurve = (trend: number) =>
  Array.from({ length: 30 }, (_, i) => ({
    time: `D${i + 1}`,
    pnl: parseFloat((trend * i + (Math.random() - 0.4) * 150).toFixed(2)),
  }));

export const SEED_STRATEGIES: TradingStrategy[] = [
  {
    id: 'st1', name: 'RSI Reversal v2', signalConditions: 'RSI < 30 + Volume > 1.5x avg', status: 'active',
    winRate: 68, maxDrawdown: 8.4, tradeCount: 182, pnlCurve: makePnlCurve(40),
    entryConditions: [
      { indicator: 'RSI', operator: '<', value: 30, weight: 0.5 },
      { indicator: 'Volume', operator: 'spike', value: 1.5, weight: 0.3 },
      { indicator: 'Sentiment', operator: '>', value: 60, weight: 0.2 },
    ],
    exitConditions: [
      { indicator: 'RSI', operator: '>', value: 60, weight: 0.6 },
      { indicator: 'MACD', operator: 'crosses_below', value: 0, weight: 0.4 },
    ],
    riskLevel: 'Medium', timeframe: '15m', backtestPeriod: '6 months', sharpeRatio: 1.84,
  },
  {
    id: 'st2', name: 'MACD Crossover', signalConditions: 'MACD crossover + Momentum > 60', status: 'active',
    winRate: 61, maxDrawdown: 12.1, tradeCount: 144, pnlCurve: makePnlCurve(20),
    entryConditions: [
      { indicator: 'MACD', operator: 'crosses_above', value: 0, weight: 0.6 },
      { indicator: 'Momentum', operator: '>', value: 60, weight: 0.4 },
    ],
    exitConditions: [
      { indicator: 'MACD', operator: 'crosses_below', value: 0, weight: 1.0 },
    ],
    riskLevel: 'Medium', timeframe: '1h', backtestPeriod: '6 months', sharpeRatio: 1.21,
  },
  {
    id: 'st3', name: 'Volume Breakout', signalConditions: 'Volume spike > 2x + Price momentum > 65', status: 'active',
    winRate: 74, maxDrawdown: 6.2, tradeCount: 97, pnlCurve: makePnlCurve(60),
    entryConditions: [
      { indicator: 'Volume', operator: 'spike', value: 2.0, weight: 0.5 },
      { indicator: 'Momentum', operator: '>', value: 65, weight: 0.3 },
      { indicator: 'Sentiment', operator: '>', value: 55, weight: 0.2 },
    ],
    exitConditions: [
      { indicator: 'Volume', operator: '<', value: 1.2, weight: 0.5 },
      { indicator: 'Momentum', operator: '<', value: 50, weight: 0.5 },
    ],
    riskLevel: 'Low', timeframe: '4h', backtestPeriod: '12 months', sharpeRatio: 2.41,
  },
  {
    id: 'st4', name: 'Momentum Surf', signalConditions: 'Momentum > 70 + RSI 50–65 zone', status: 'draft',
    winRate: 55, maxDrawdown: 15.8, tradeCount: 34, pnlCurve: makePnlCurve(10),
    entryConditions: [
      { indicator: 'Momentum', operator: '>', value: 70, weight: 0.7 },
      { indicator: 'RSI', operator: '>', value: 50, weight: 0.3 },
    ],
    exitConditions: [
      { indicator: 'Momentum', operator: '<', value: 60, weight: 1.0 },
    ],
    riskLevel: 'High', timeframe: '1h', backtestPeriod: '3 months', sharpeRatio: 0.88,
  },
  {
    id: 'st5', name: 'Composite AI Signal', signalConditions: 'RSI + MACD + Sentiment + Volume composite score > 75', status: 'active',
    winRate: 79, maxDrawdown: 5.1, tradeCount: 58, pnlCurve: makePnlCurve(80),
    entryConditions: [
      { indicator: 'RSI', operator: '<', value: 35, weight: 0.25 },
      { indicator: 'MACD', operator: 'crosses_above', value: 0, weight: 0.25 },
      { indicator: 'Sentiment', operator: '>', value: 65, weight: 0.25 },
      { indicator: 'Volume', operator: 'spike', value: 1.8, weight: 0.25 },
    ],
    exitConditions: [
      { indicator: 'RSI', operator: '>', value: 70, weight: 0.4 },
      { indicator: 'Sentiment', operator: '<', value: 40, weight: 0.3 },
      { indicator: 'MACD', operator: 'crosses_below', value: 0, weight: 0.3 },
    ],
    riskLevel: 'Low', timeframe: '1h', backtestPeriod: '12 months', sharpeRatio: 3.12,
  },
];

// ── DCA Bot Safety Order Calculator ───────────────────────────────
export function calcSafetyOrders(
  basePrice: number,
  baseOrderSize: number,
  safetyOrderSize: number,
  deviationStep: number,
  stepMultiplier: number,
  sizeMultiplier: number,
  count: number,
): SafetyOrder[] {
  const orders: SafetyOrder[] = [];
  let cumVol = baseOrderSize;
  let avgPrice = basePrice;
  let stepDev = deviationStep;
  let totalDev = 0;
  let orderSz = safetyOrderSize;

  for (let i = 0; i < count; i++) {
    if (i > 0) {
      stepDev = stepDev * stepMultiplier;
      orderSz = orderSz * sizeMultiplier;
    }
    totalDev += (i === 0 ? deviationStep : stepDev);
    const price = parseFloat((basePrice * (1 - totalDev / 100)).toFixed(2));
    cumVol += orderSz;
    // weighted average
    avgPrice = parseFloat(
      ((avgPrice * (cumVol - orderSz) + price * orderSz) / cumVol).toFixed(2)
    );
    orders.push({
      index: i + 1,
      deviationPct: parseFloat(totalDev.toFixed(2)),
      price,
      orderSize: parseFloat(orderSz.toFixed(2)),
      cumulativeVolume: parseFloat(cumVol.toFixed(2)),
      avgPrice,
      filled: false,
    });
  }
  return orders;
}

// ── Seed DCA Bots ──────────────────────────────────────────────────
export const SEED_DCA_BOTS: DCABot[] = [
  {
    id: 'dca1',
    name: 'ETH/USDT Classic',
    coinPair: 'ETH/USDT',
    exchange: 'Binance',
    mode: 'simulation',
    status: 'running',
    baseOrderSize: 20,
    safetyOrderSize: 15,
    maxSafetyOrders: 3,
    deviationStep: 1,
    deviationStepMultiplier: 4,
    safetyOrderSizeMultiplier: 1.7,
    takeProfit: 2.4,
    stopLoss: 26,
    stopLossTimeout: 300,
    trailingTP: 0,
    reinvestProfit: 100,
    startCondition: 'composite',
    rsiPeriod: 7,
    rsiTimeframe: '15m',
    rsiThreshold: 30,
    macdEnabled: true,
    macdSignalThreshold: -0.1,
    volumeMultiplierEnabled: true,
    volumeMultiplierThreshold: 1.5,
    compositeScore: 87,
    atrEnabled: true,
    atrPeriod: 14,
    atrMultiplier: 1.5,
    autoCloseDuration: 72,
    cooldownSec: 0,
    maxActiveTrades: 1,
    totalBalance: 1000,
    maxBotUsage: 103.85,
    currentAvgPrice: 1317.06,
    totalPnl: 284,
    tradeCount: 18,
    winRate: 72,
    filledSafetyOrders: 2,
    safetyOrders: calcSafetyOrders(1348.88, 20, 15, 1, 4, 1.7, 3),
    pnlHistory: makePnlHistory(100),
  },
  {
    id: 'dca2',
    name: 'BTC/USDT Accumulator',
    coinPair: 'BTC/USDT',
    exchange: 'Bybit',
    mode: 'simulation',
    status: 'running',
    baseOrderSize: 50,
    safetyOrderSize: 40,
    maxSafetyOrders: 5,
    deviationStep: 1.5,
    deviationStepMultiplier: 3,
    safetyOrderSizeMultiplier: 1.5,
    takeProfit: 3,
    stopLoss: 20,
    stopLossTimeout: 600,
    trailingTP: 0.5,
    reinvestProfit: 100,
    startCondition: 'composite',
    rsiPeriod: 14,
    rsiTimeframe: '1h',
    rsiThreshold: 35,
    macdEnabled: true,
    macdSignalThreshold: 0,
    volumeMultiplierEnabled: false,
    volumeMultiplierThreshold: 2.0,
    compositeScore: 94,
    atrEnabled: true,
    atrPeriod: 14,
    atrMultiplier: 2.0,
    autoCloseDuration: 48,
    cooldownSec: 0,
    maxActiveTrades: 1,
    totalBalance: 2000,
    maxBotUsage: 474.5,
    currentAvgPrice: 65800,
    totalPnl: 1240,
    tradeCount: 31,
    winRate: 68,
    filledSafetyOrders: 3,
    safetyOrders: calcSafetyOrders(67240, 50, 40, 1.5, 3, 1.5, 5),
    pnlHistory: makePnlHistory(400),
  },
  {
    id: 'dca3',
    name: 'SOL/USDT Aggressive',
    coinPair: 'SOL/USDT',
    exchange: 'OKX',
    mode: 'simulation',
    status: 'paused',
    baseOrderSize: 30,
    safetyOrderSize: 25,
    maxSafetyOrders: 7,
    deviationStep: 2.0,
    deviationStepMultiplier: 2.5,
    safetyOrderSizeMultiplier: 2.0,
    takeProfit: 4.5,
    stopLoss: 30,
    stopLossTimeout: 900,
    trailingTP: 1.0,
    reinvestProfit: 80,
    startCondition: 'rsi_oversold',
    rsiPeriod: 14,
    rsiTimeframe: '4h',
    rsiThreshold: 28,
    macdEnabled: false,
    macdSignalThreshold: 0,
    volumeMultiplierEnabled: true,
    volumeMultiplierThreshold: 2.0,
    compositeScore: 0,
    atrEnabled: false,
    atrPeriod: 14,
    atrMultiplier: 1.0,
    autoCloseDuration: 96,
    cooldownSec: 300,
    maxActiveTrades: 2,
    totalBalance: 1500,
    maxBotUsage: 320,
    currentAvgPrice: 78.4,
    totalPnl: -42,
    tradeCount: 8,
    winRate: 50,
    filledSafetyOrders: 1,
    safetyOrders: calcSafetyOrders(82, 30, 25, 2.0, 2.5, 2.0, 7),
    pnlHistory: makePnlHistory(-20),
  },
];

// ── Seed Grid Bots ─────────────────────────────────────────────────
export const SEED_GRID_BOTS: GridBot[] = [
  {
    id: 'grid1',
    name: 'BTC Grid Wide',
    coinPair: 'BTC/USDT',
    exchange: 'Binance',
    mode: 'simulation',
    status: 'running',
    upperPrice: 72000,
    lowerPrice: 60000,
    gridLines: 20,
    investmentAmount: 500,
    gridSpacing: 0.6,
    gridType: 'geometric',
    autoRebalance: true,
    atrEnabled: true,
    atrPeriod: 14,
    totalPnl: 184,
    gridProfit: 22,
    openOrders: 18,
    filledOrders: 42,
    profitPerGrid: 1.1,
    annualizedReturn: 42.8,
    pnlHistory: makePnlHistory(80),
  },
  {
    id: 'grid2',
    name: 'ETH Grid Tight',
    coinPair: 'ETH/USDT',
    exchange: 'OKX',
    mode: 'simulation',
    status: 'running',
    upperPrice: 3800,
    lowerPrice: 3200,
    gridLines: 30,
    investmentAmount: 300,
    gridSpacing: 0.67,
    gridType: 'arithmetic',
    autoRebalance: false,
    atrEnabled: false,
    atrPeriod: 14,
    totalPnl: 67,
    gridProfit: 9,
    openOrders: 28,
    filledOrders: 71,
    profitPerGrid: 0.3,
    annualizedReturn: 28.4,
    pnlHistory: makePnlHistory(30),
  },
  {
    id: 'grid3',
    name: 'SOL Grid ATR',
    coinPair: 'SOL/USDT',
    exchange: 'Bybit',
    mode: 'simulation',
    status: 'running',
    upperPrice: 100,
    lowerPrice: 65,
    gridLines: 25,
    investmentAmount: 400,
    gridSpacing: 1.4,
    gridType: 'geometric',
    autoRebalance: true,
    atrEnabled: true,
    atrPeriod: 14,
    totalPnl: 112,
    gridProfit: 18,
    openOrders: 22,
    filledOrders: 56,
    profitPerGrid: 0.72,
    annualizedReturn: 38.1,
    pnlHistory: makePnlHistory(60),
  },
];

// ── Seed Signal Bots ───────────────────────────────────────────────
export const SEED_SIGNAL_BOTS: SignalBot[] = [
  {
    id: 'sig1',
    name: 'TV RSI Scanner',
    coinPair: 'BTC/USDT',
    exchange: 'Binance',
    mode: 'simulation',
    status: 'running',
    webhookUrl: 'https://luna.ai/wh/abc123xyz',
    signalSource: 'TradingView',
    maxInvestmentPct: 100,
    volumePerEntryPct: 100,
    volumePerExitPct: 100,
    priceDeviationEntry: 1,
    priceDeviationExit: 1,
    takeProfit: 2.4,
    stopLoss: 5,
    minConfidence: 65,
    sentimentFilter: 'bullish_only',
    cooldownAfterSL: 300,
    totalPnl: 420,
    tradeCount: 38,
    signalsReceived: 52,
    signalsExecuted: 38,
    signalsFiltered: 14,
    lastSignalTime: new Date(Date.now() - 8 * 60000),
    pnlHistory: makePnlHistory(200),
  },
  {
    id: 'sig2',
    name: 'LUNA Signal Bot',
    coinPair: 'ETH/USDT',
    exchange: 'Bybit',
    mode: 'simulation',
    status: 'running',
    webhookUrl: 'https://luna.ai/wh/luna456abc',
    signalSource: 'LUNA',
    maxInvestmentPct: 80,
    volumePerEntryPct: 100,
    volumePerExitPct: 100,
    priceDeviationEntry: 1,
    priceDeviationExit: 1,
    takeProfit: 3.5,
    stopLoss: 7,
    minConfidence: 75,
    sentimentFilter: 'any',
    cooldownAfterSL: 600,
    totalPnl: 890,
    tradeCount: 61,
    signalsReceived: 74,
    signalsExecuted: 61,
    signalsFiltered: 13,
    lastSignalTime: new Date(Date.now() - 22 * 60000),
    pnlHistory: makePnlHistory(600),
  },
  {
    id: 'sig3',
    name: 'Whale Alert Bot',
    coinPair: 'BTC/USDT',
    exchange: 'Binance',
    mode: 'simulation',
    status: 'stopped',
    webhookUrl: 'https://luna.ai/wh/whale789xyz',
    signalSource: 'Custom',
    maxInvestmentPct: 60,
    volumePerEntryPct: 50,
    volumePerExitPct: 100,
    priceDeviationEntry: 0.5,
    priceDeviationExit: 0.5,
    takeProfit: 5.0,
    stopLoss: 3.0,
    minConfidence: 80,
    sentimentFilter: 'bullish_only',
    cooldownAfterSL: 900,
    totalPnl: 1240,
    tradeCount: 22,
    signalsReceived: 31,
    signalsExecuted: 22,
    signalsFiltered: 9,
    lastSignalTime: new Date(Date.now() - 2 * 3600000),
    pnlHistory: makePnlHistory(800),
  },
];

// ── Seed Arbitrage Bots ────────────────────────────────────────────
const makeArbitrageOpportunities = (): ArbitrageOpportunity[] => [
  { id: 'ao1', coinPair: 'BTC/USDT', buyExchange: 'Binance', sellExchange: 'Bybit', buyPrice: 67240, sellPrice: 67318, spreadPct: 0.116, estimatedProfit: 3.80, status: 'completed', detectedAt: new Date(Date.now() - 35000) },
  { id: 'ao2', coinPair: 'ETH/USDT', buyExchange: 'OKX', sellExchange: 'Binance', buyPrice: 3241, sellPrice: 3256, spreadPct: 0.463, estimatedProfit: 11.20, status: 'completed', detectedAt: new Date(Date.now() - 120000) },
  { id: 'ao3', coinPair: 'SOL/USDT', buyExchange: 'Bybit', sellExchange: 'Kraken', buyPrice: 78.4, sellPrice: 78.72, spreadPct: 0.408, estimatedProfit: 2.40, status: 'missed', detectedAt: new Date(Date.now() - 240000) },
  { id: 'ao4', coinPair: 'BNB/USDT', buyExchange: 'Binance', sellExchange: 'Gate.io', buyPrice: 412.8, sellPrice: 413.9, spreadPct: 0.266, estimatedProfit: 1.90, status: 'completed', detectedAt: new Date(Date.now() - 480000) },
];

export const SEED_ARBITRAGE_BOTS: ArbitrageBot[] = [
  {
    id: 'arb1',
    name: 'ARB-BOT-1',
    coinPairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'],
    exchanges: ['Binance', 'Bybit', 'OKX', 'Kraken'],
    mode: 'simulation',
    status: 'running',
    minSpreadPct: 0.1,
    maxInvestmentPerTrade: 500,
    feePerSide: 0.1,
    executionDelayMs: 120,
    maxDailyTrades: 50,
    maxDailyLoss: 100,
    totalPnl: 842,
    tradeCount: 147,
    opportunitiesDetected: 312,
    opportunitiesExecuted: 147,
    avgSpreadCapture: 0.28,
    winRate: 91,
    pnlHistory: makePnlHistory(500),
    recentOpportunities: makeArbitrageOpportunities(),
  },
  {
    id: 'arb2',
    name: 'ARB-BOT-2',
    coinPairs: ['BTC/USDT', 'ETH/USDT'],
    exchanges: ['Binance', 'Coinbase', 'Kraken'],
    mode: 'simulation',
    status: 'paused',
    minSpreadPct: 0.15,
    maxInvestmentPerTrade: 1000,
    feePerSide: 0.15,
    executionDelayMs: 200,
    maxDailyTrades: 30,
    maxDailyLoss: 200,
    totalPnl: 1240,
    tradeCount: 88,
    opportunitiesDetected: 198,
    opportunitiesExecuted: 88,
    avgSpreadCapture: 0.34,
    winRate: 88,
    pnlHistory: makePnlHistory(800),
    recentOpportunities: [],
  },
];

// ── Seed Portfolio ─────────────────────────────────────────────────
export const SEED_PORTFOLIO: PortfolioAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.42, usdValue: 28240, allocation: 44.2, targetAllocation: 40, drift: 4.2, change24h: 2.3, volatility30d: 38.4, beta: 1.0, riskScore: 62 },
  { symbol: 'ETH', name: 'Ethereum', balance: 8.1, usdValue: 19440, allocation: 30.4, targetAllocation: 30, drift: 0.4, change24h: -1.1, volatility30d: 44.2, beta: 1.18, riskScore: 68 },
  { symbol: 'SOL', name: 'Solana', balance: 120, usdValue: 9600, allocation: 15.0, targetAllocation: 15, drift: 0, change24h: 4.7, volatility30d: 62.8, beta: 1.42, riskScore: 75 },
  { symbol: 'BNB', name: 'BNB', balance: 14.2, usdValue: 5822, allocation: 9.1, targetAllocation: 10, drift: -0.9, change24h: 0.8, volatility30d: 31.2, beta: 0.88, riskScore: 54 },
  { symbol: 'USDT', name: 'Tether', balance: 880, usdValue: 880, allocation: 1.4, targetAllocation: 5, drift: -3.6, change24h: 0, volatility30d: 0.1, beta: 0.0, riskScore: 5 },
];

export const SEED_EXCHANGES: ExchangeConnection[] = [
  { id: 'ex1', name: 'Binance Main', type: 'Binance', mode: 'real', status: 'connected', totalBalance: 28240, apiKeyMasked: 'sk-Bn3f...a92x', lastSync: new Date(Date.now() - 45000) },
  { id: 'ex2', name: 'Bybit Trading', type: 'Bybit', mode: 'real', status: 'connected', totalBalance: 14400, apiKeyMasked: 'sk-By7k...c41z', lastSync: new Date(Date.now() - 120000) },
  { id: 'ex3', name: 'OKX Demo', type: 'OKX', mode: 'demo', status: 'connected', totalBalance: 10000, apiKeyMasked: 'sk-Ox9p...f88w', lastSync: new Date(Date.now() - 300000) },
];

export const SEED_SMART_TRADES: SmartTrade[] = [
  { id: 'st1', coinPair: 'BTC/USDT', exchange: 'Binance', direction: 'long', status: 'open', entryPrice: 66200, currentPrice: 67240, quantity: 0.05, takeProfitPct: 3, stopLossPct: 2, trailingStopPct: 1, trailingTPPct: 0.5, unrealizedPnl: 52, realizedPnl: 0, openedAt: new Date(Date.now() - 3600000), leverage: 3, marginType: 'isolated', liquidationPrice: 44133 },
  { id: 'st2', coinPair: 'ETH/USDT', exchange: 'Bybit', direction: 'long', status: 'open', entryPrice: 3340, currentPrice: 3280, quantity: 2, takeProfitPct: 4, stopLossPct: 3, trailingStopPct: 0, trailingTPPct: 0, unrealizedPnl: -120, realizedPnl: 0, openedAt: new Date(Date.now() - 7200000), leverage: 1, marginType: 'cross', liquidationPrice: 0 },
  { id: 'st3', coinPair: 'SOL/USDT', exchange: 'Binance', direction: 'short', status: 'closed', entryPrice: 82, currentPrice: 78, quantity: 10, takeProfitPct: 5, stopLossPct: 3, trailingStopPct: 1.5, trailingTPPct: 0, unrealizedPnl: 0, realizedPnl: 38, openedAt: new Date(Date.now() - 86400000), leverage: 2, marginType: 'isolated', liquidationPrice: 0 },
];

// ── Helpers ────────────────────────────────────────────────────────
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateNewSignal(): CryptoSignal {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ARB/USDT', 'AVAX/USDT'];
  const indicators: CryptoSignal['indicator'][] = ['RSI', 'MACD', 'volume_spike', 'momentum', 'sentiment', 'whale_alert'];
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const indicator = indicators[Math.floor(Math.random() * indicators.length)];
  const value = parseFloat(randomBetween(20, 90).toFixed(2));
  const threshold = indicator === 'RSI' ? 30 : indicator === 'volume_spike' ? 2.0 : indicator === 'MACD' ? 0.5 : indicator === 'sentiment' ? 70 : indicator === 'whale_alert' ? 5000 : 65;
  const triggered = value < threshold || (indicator === 'volume_spike' && value > threshold) || (indicator === 'momentum' && value > threshold) || (indicator === 'sentiment' && value > threshold) || (indicator === 'whale_alert' && value > threshold);
  const severity: SignalSeverity = triggered ? (value < 25 || value > 85 ? 'critical' : 'warn') : 'info';
  const sentimentScore = parseFloat(randomBetween(-1, 1).toFixed(2));
  return {
    id: `s${Date.now()}`,
    coinPair: pair,
    indicator,
    value,
    threshold,
    triggered,
    severity,
    timestamp: new Date(),
    sentimentScore,
    sentimentLabel: sentimentScore > 0.2 ? 'Bullish' : sentimentScore < -0.2 ? 'Bearish' : 'Neutral',
    source: ['LUNA', 'TradingView', 'On-Chain', 'Webhook'][Math.floor(Math.random() * 4)] as CryptoSignal['source'],
    confidence: Math.floor(randomBetween(40, 98)),
  };
}

// ── Risk Heatmap Data ──────────────────────────────────────────────
export interface RiskHeatmapCell {
  botName: string;
  coinPair: string;
  riskScore: number;    // 0–100
  exposure: number;     // USDT
  drawdown: number;     // % current drawdown
  volatility: number;   // % 24h volatility
}

export function generateRiskHeatmap(): RiskHeatmapCell[] {
  return [
    { botName: 'ALPHA-1', coinPair: 'BTC/USDT', riskScore: 42, exposure: 11240, drawdown: 2.1, volatility: 3.8 },
    { botName: 'BETA-X', coinPair: 'ETH/USDT', riskScore: 68, exposure: 9820, drawdown: 8.4, volatility: 5.2 },
    { botName: 'GAMMA-3', coinPair: 'SOL/USDT', riskScore: 55, exposure: 15600, drawdown: 3.2, volatility: 7.1 },
    { botName: 'DELTA-9', coinPair: 'ARB/USDT', riskScore: 78, exposure: 9950, drawdown: 12.8, volatility: 9.4 },
    { botName: 'OMEGA-7', coinPair: 'BNB/USDT', riskScore: 38, exposure: 12800, drawdown: 1.8, volatility: 3.1 },
    { botName: 'DCA ETH', coinPair: 'ETH/USDT', riskScore: 31, exposure: 1000, drawdown: 0.8, volatility: 5.2 },
    { botName: 'DCA BTC', coinPair: 'BTC/USDT', riskScore: 28, exposure: 2000, drawdown: 0.4, volatility: 3.8 },
    { botName: 'GRID BTC', coinPair: 'BTC/USDT', riskScore: 22, exposure: 500, drawdown: 0.2, volatility: 3.8 },
    { botName: 'GRID ETH', coinPair: 'ETH/USDT', riskScore: 25, exposure: 300, drawdown: 0.3, volatility: 5.2 },
    { botName: 'ARB-BOT-1', coinPair: 'MULTI', riskScore: 15, exposure: 500, drawdown: 0.1, volatility: 1.2 },
    { botName: 'TV RSI', coinPair: 'BTC/USDT', riskScore: 48, exposure: 800, drawdown: 3.4, volatility: 3.8 },
    { botName: 'LUNA SIG', coinPair: 'ETH/USDT', riskScore: 52, exposure: 1200, drawdown: 4.1, volatility: 5.2 },
  ];
}


// ── NEW: Crypto Wallet & Banking System ────────────────────────────
export type AccountType = 'trading' | 'savings' | 'emergency' | 'profit';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'bot_profit' | 'fee' | 'auto_sweep';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;          // quantity
  usdValue: number;         // current USD value
  network?: string;         // blockchain network (Ethereum, Solana, etc.)
  walletAddress?: string;   // public wallet address
  priceUsd: number;
  change24h: number;        // % change in last 24h
  volatility?: number;      // annualized volatility %
}

export interface WalletAccount {
  id: string;
  accountType: AccountType;
  name: string;             // e.g., "Trading Wallet", "Profit Savings"
  description?: string;
  totalUsdValue: number;
  assets: CryptoAsset[];
  createdAt: Date;
  updatedAt: Date;
  // NEW: Auto-sweep settings
  autoSweepEnabled?: boolean;
  autoSweepPercentage?: number;  // % of profits to auto-sweep
  autoSweepTarget?: string;      // target account ID
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  status: TransactionStatus;
  fromAsset: string;       // symbol (e.g., "BTC")
  toAsset: string;         // symbol (e.g., "USDT")
  fromAmount: number;
  toAmount: number;
  usdValue: number;
  fee: number;             // in USD
  exchangeRate?: number;   // if swap
  botId?: string;          // if from bot profit
  relatedAccountId?: string; // if transfer
  description: string;
  timestamp: Date;
  completedAt?: Date;
  txHash?: string;         // blockchain transaction hash
  notes?: string;
}

export interface PortfolioSnapshot {
  timestamp: Date;
  totalUsdValue: number;
  byAsset: { symbol: string; usdValue: number; percentage: number }[];
  byAccount: { accountId: string; usdValue: number; percentage: number }[];
  dayChange: number;       // USD
  dayChangePercent: number; // %
}

// Seed data for wallets
export const SEED_WALLET_ACCOUNTS: WalletAccount[] = [
  {
    id: "wallet_trading",
    accountType: "trading",
    name: "Active Trading",
    description: "Primary wallet for bot operations",
    totalUsdValue: 45230.50,
    assets: [
      { symbol: "BTC", name: "Bitcoin", balance: 0.85, usdValue: 35700, network: "Bitcoin", priceUsd: 42000, change24h: 2.3, volatility: 38.4 },
      { symbol: "ETH", name: "Ethereum", balance: 5.2, usdValue: 9360, network: "Ethereum", priceUsd: 1800, change24h: 1.8, volatility: 44.2 },
      { symbol: "USDT", name: "Tether", balance: 170.5, usdValue: 170.5, network: "Ethereum", priceUsd: 1.0, change24h: 0.0, volatility: 0.1 },
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
    autoSweepEnabled: true,
    autoSweepPercentage: 20,
    autoSweepTarget: "wallet_savings",
  },
  {
    id: "wallet_savings",
    accountType: "savings",
    name: "Profit Savings Vault",
    description: "Long-term profit accumulation",
    totalUsdValue: 28450.75,
    assets: [
      { symbol: "BTC", name: "Bitcoin", balance: 0.45, usdValue: 18900, network: "Bitcoin", priceUsd: 42000, change24h: 2.3, volatility: 38.4 },
      { symbol: "ETH", name: "Ethereum", balance: 3.0, usdValue: 5400, network: "Ethereum", priceUsd: 1800, change24h: 1.8, volatility: 44.2 },
      { symbol: "USDT", name: "Tether", balance: 4150.75, usdValue: 4150.75, network: "Ethereum", priceUsd: 1.0, change24h: 0.0, volatility: 0.1 },
    ],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date(),
  },
  {
    id: "wallet_emergency",
    accountType: "emergency",
    name: "Emergency Reserve",
    description: "Backup funds for margin calls or opportunities",
    totalUsdValue: 12000.00,
    assets: [
      { symbol: "USDT", name: "Tether", balance: 12000, usdValue: 12000, network: "Ethereum", priceUsd: 1.0, change24h: 0.0, volatility: 0.1 },
    ],
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date(),
  },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_001",
    accountId: "wallet_trading",
    type: "deposit",
    status: "completed",
    fromAsset: "USDT",
    toAsset: "USDT",
    fromAmount: 5000,
    toAmount: 5000,
    usdValue: 5000,
    fee: 0,
    description: "Initial deposit",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    txHash: "0x1234567890abcdef",
  },
  {
    id: "tx_002",
    accountId: "wallet_trading",
    type: "bot_profit",
    status: "completed",
    fromAsset: "USDT",
    toAsset: "USDT",
    fromAmount: 850,
    toAmount: 850,
    usdValue: 850,
    fee: 0,
    botId: "arb-bot-1",
    description: "Profit from ARB-BOT-1",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "tx_003",
    accountId: "wallet_trading",
    type: "auto_sweep",
    status: "completed",
    fromAsset: "USDT",
    toAsset: "USDT",
    fromAmount: 170,
    toAmount: 170,
    usdValue: 170,
    fee: 0,
    relatedAccountId: "wallet_savings",
    description: "Auto-sweep 20% of profits to Savings",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: "tx_004",
    accountId: "wallet_trading",
    type: "transfer",
    status: "completed",
    fromAsset: "BTC",
    toAsset: "BTC",
    fromAmount: 0.1,
    toAmount: 0.1,
    usdValue: 4200,
    fee: 5,
    relatedAccountId: "wallet_savings",
    description: "Transfer 0.1 BTC to Savings",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    txHash: "0xabcdef1234567890",
  },
  {
    id: "tx_005",
    accountId: "wallet_trading",
    type: "withdrawal",
    status: "pending",
    fromAsset: "ETH",
    toAsset: "ETH",
    fromAmount: 1.5,
    toAmount: 1.5,
    usdValue: 2700,
    fee: 10,
    description: "Withdrawal to external wallet",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    notes: "Pending blockchain confirmation",
  },
];

export function generatePortfolioSnapshot(): PortfolioSnapshot {
  const allAssets = SEED_WALLET_ACCOUNTS.flatMap(acc => acc.assets);
  const totalUsdValue = SEED_WALLET_ACCOUNTS.reduce((sum, acc) => sum + acc.totalUsdValue, 0);
  
  const byAsset = Array.from(
    allAssets.reduce((map, asset) => {
      const existing = map.get(asset.symbol) || { symbol: asset.symbol, usdValue: 0 };
      existing.usdValue += asset.usdValue;
      map.set(asset.symbol, existing);
      return map;
    }, new Map<string, any>()).values()
  ).map(item => ({ ...item, percentage: (item.usdValue / totalUsdValue) * 100 }));

  const byAccount = SEED_WALLET_ACCOUNTS.map(acc => ({
    accountId: acc.id,
    usdValue: acc.totalUsdValue,
    percentage: (acc.totalUsdValue / totalUsdValue) * 100,
  }));

  return {
    timestamp: new Date(),
    totalUsdValue,
    byAsset,
    byAccount,
    dayChange: 1250.50,
    dayChangePercent: 2.8,
  };
}
