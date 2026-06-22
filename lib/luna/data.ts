"use client";
// LUNA simulated data generators — client-side seed data & helpers

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
  indicator: 'RSI' | 'MACD' | 'volume_spike' | 'momentum';
  value: number;
  threshold: number;
  triggered: boolean;
  severity: SignalSeverity;
  timestamp: Date;
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

export interface DCABot {
  id: string;
  name: string;
  coinPair: string;
  exchange: string;
  mode: 'simulation' | 'live';
  status: 'running' | 'paused' | 'stopped';
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
  // Start condition
  startCondition: 'immediately' | 'rsi_oversold' | 'signal';
  rsiPeriod: number;
  rsiTimeframe: string;
  rsiThreshold: number;
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
  filledSafetyOrders: number;
  safetyOrders: SafetyOrder[];
  pnlHistory: { time: string; pnl: number }[];
}

export interface GridBot {
  id: string;
  name: string;
  coinPair: string;
  exchange: string;
  mode: 'simulation' | 'live';
  status: 'running' | 'paused' | 'stopped';
  // Grid config
  upperPrice: number;
  lowerPrice: number;
  gridLines: number;
  investmentAmount: number;   // USDT total
  gridSpacing: number;        // % between lines
  // Performance
  totalPnl: number;
  gridProfit: number;
  openOrders: number;
  filledOrders: number;
  pnlHistory: { time: string; pnl: number }[];
}

export interface SignalBot {
  id: string;
  name: string;
  coinPair: string;
  exchange: string;
  mode: 'simulation' | 'live';
  status: 'running' | 'paused' | 'stopped';
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
  // Performance
  totalPnl: number;
  tradeCount: number;
  signalsReceived: number;
  signalsExecuted: number;
  lastSignalTime: Date | null;
  pnlHistory: { time: string; pnl: number }[];
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
  { id: '1', eventType: 'SIGNAL', layer: 'V2', message: 'RSI alert triggered on BTC/USDT — value: 28.4 (threshold: 30)', severity: 'critical', timestamp: new Date(Date.now() - 12000) },
  { id: '2', eventType: 'BOT', layer: 'V5', message: 'Bot ALPHA-1 executed BUY 0.05 BTC @ $67,240 [SIM]', severity: 'info', timestamp: new Date(Date.now() - 28000) },
  { id: '3', eventType: 'MONETIZE', layer: 'V7', message: 'Signal classified as SaaS opportunity — alpha score: 87', severity: 'info', timestamp: new Date(Date.now() - 45000) },
  { id: '4', eventType: 'COMPANY', layer: 'V8', message: 'New company blueprint generated: "CryptoSignal Pro API"', severity: 'info', timestamp: new Date(Date.now() - 72000) },
  { id: '5', eventType: 'VOLUME', layer: 'V1', message: 'ETH/USDT volume spike detected — 340% above 24h average', severity: 'warn', timestamp: new Date(Date.now() - 95000) },
  { id: '6', eventType: 'STRATEGY', layer: 'V4', message: 'Strategy "RSI Reversal v2" backtest complete — Win rate: 68%', severity: 'info', timestamp: new Date(Date.now() - 130000) },
  { id: '7', eventType: 'DEPLOY', layer: 'V9', message: 'API key issued for service "momentum-scanner-v1"', severity: 'info', timestamp: new Date(Date.now() - 210000) },
  { id: '8', eventType: 'ECOSYSTEM', layer: 'V12', message: 'Autonomous expansion triggered — 3 new service nodes spawned', severity: 'warn', timestamp: new Date(Date.now() - 360000) },
];

// ── Seed Crypto Signals ────────────────────────────────────────────
export const SEED_SIGNALS: CryptoSignal[] = [
  { id: 's1', coinPair: 'BTC/USDT', indicator: 'RSI', value: 28.4, threshold: 30, triggered: true, severity: 'critical', timestamp: new Date(Date.now() - 12000) },
  { id: 's2', coinPair: 'ETH/USDT', indicator: 'volume_spike', value: 3.4, threshold: 2.0, triggered: true, severity: 'warn', timestamp: new Date(Date.now() - 95000) },
  { id: 's3', coinPair: 'SOL/USDT', indicator: 'MACD', value: 0.82, threshold: 0.5, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 180000) },
  { id: 's4', coinPair: 'BNB/USDT', indicator: 'momentum', value: 72.1, threshold: 65, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 240000) },
  { id: 's5', coinPair: 'ARB/USDT', indicator: 'RSI', value: 71.8, threshold: 70, triggered: true, severity: 'warn', timestamp: new Date(Date.now() - 300000) },
  { id: 's6', coinPair: 'AVAX/USDT', indicator: 'MACD', value: -0.34, threshold: -0.5, triggered: false, severity: 'info', timestamp: new Date(Date.now() - 420000) },
  { id: 's7', coinPair: 'BTC/USDT', indicator: 'momentum', value: 55.2, threshold: 65, triggered: false, severity: 'info', timestamp: new Date(Date.now() - 600000) },
  { id: 's8', coinPair: 'DOGE/USDT', indicator: 'volume_spike', value: 4.7, threshold: 2.0, triggered: true, severity: 'critical', timestamp: new Date(Date.now() - 720000) },
];

// ── Seed Bots ──────────────────────────────────────────────────────
const makePnlHistory = (base: number, steps = 24) =>
  Array.from({ length: steps }, (_, i) => ({
    time: `${i}h`,
    pnl: parseFloat((base + (Math.random() - 0.44) * 200 * ((i + 1) / steps)).toFixed(2)),
  }));

export const SEED_BOTS: TradingBot[] = [
  { id: 'b1', name: 'ALPHA-1', coinPair: 'BTC/USDT', strategy: 'RSI Reversal v2', mode: 'simulation', status: 'running', virtualBalance: 11240, totalPnl: 1240, tradeCount: 47, pnlHistory: makePnlHistory(0) },
  { id: 'b2', name: 'BETA-X', coinPair: 'ETH/USDT', strategy: 'MACD Crossover', mode: 'simulation', status: 'running', virtualBalance: 9820, totalPnl: -180, tradeCount: 33, pnlHistory: makePnlHistory(-100) },
  { id: 'b3', name: 'GAMMA-3', coinPair: 'SOL/USDT', strategy: 'Volume Breakout', mode: 'live', status: 'running', virtualBalance: 15600, totalPnl: 5600, tradeCount: 89, pnlHistory: makePnlHistory(300) },
  { id: 'b4', name: 'DELTA-9', coinPair: 'ARB/USDT', strategy: 'Momentum Surf', mode: 'simulation', status: 'paused', virtualBalance: 9950, totalPnl: -50, tradeCount: 12, pnlHistory: makePnlHistory(-50) },
];

// ── Seed Strategies ────────────────────────────────────────────────
const makePnlCurve = (trend: number) =>
  Array.from({ length: 30 }, (_, i) => ({
    time: `D${i + 1}`,
    pnl: parseFloat((trend * i + (Math.random() - 0.4) * 150).toFixed(2)),
  }));

export const SEED_STRATEGIES: TradingStrategy[] = [
  { id: 'st1', name: 'RSI Reversal v2', signalConditions: 'RSI < 30 + Volume > 1.5x avg', status: 'active', winRate: 68, maxDrawdown: 8.4, tradeCount: 182, pnlCurve: makePnlCurve(40) },
  { id: 'st2', name: 'MACD Crossover', signalConditions: 'MACD crossover + Momentum > 60', status: 'active', winRate: 61, maxDrawdown: 12.1, tradeCount: 144, pnlCurve: makePnlCurve(20) },
  { id: 'st3', name: 'Volume Breakout', signalConditions: 'Volume spike > 2x + Price momentum > 65', status: 'active', winRate: 74, maxDrawdown: 6.2, tradeCount: 97, pnlCurve: makePnlCurve(60) },
  { id: 'st4', name: 'Momentum Surf', signalConditions: 'Momentum > 70 + RSI 50–65 zone', status: 'draft', winRate: 55, maxDrawdown: 15.8, tradeCount: 34, pnlCurve: makePnlCurve(10) },
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
    startCondition: 'rsi_oversold',
    rsiPeriod: 7,
    rsiTimeframe: '15m',
    rsiThreshold: 30,
    autoCloseDuration: 72,
    cooldownSec: 0,
    maxActiveTrades: 1,
    totalBalance: 1000,
    maxBotUsage: 103.85,
    currentAvgPrice: 1317.06,
    totalPnl: 284,
    tradeCount: 18,
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
    startCondition: 'rsi_oversold',
    rsiPeriod: 14,
    rsiTimeframe: '1h',
    rsiThreshold: 35,
    autoCloseDuration: 48,
    cooldownSec: 0,
    maxActiveTrades: 1,
    totalBalance: 2000,
    maxBotUsage: 474.5,
    currentAvgPrice: 65800,
    totalPnl: 1240,
    tradeCount: 31,
    filledSafetyOrders: 3,
    safetyOrders: calcSafetyOrders(67240, 50, 40, 1.5, 3, 1.5, 5),
    pnlHistory: makePnlHistory(400),
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
    totalPnl: 184,
    gridProfit: 22,
    openOrders: 18,
    filledOrders: 42,
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
    totalPnl: 67,
    gridProfit: 9,
    openOrders: 28,
    filledOrders: 71,
    pnlHistory: makePnlHistory(30),
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
    webhookUrl: 'https://3commas.io/signal/wh/abc123xyz',
    signalSource: 'TradingView',
    maxInvestmentPct: 100,
    volumePerEntryPct: 100,
    volumePerExitPct: 100,
    priceDeviationEntry: 1,
    priceDeviationExit: 1,
    takeProfit: 2.4,
    stopLoss: 5,
    totalPnl: 420,
    tradeCount: 38,
    signalsReceived: 52,
    signalsExecuted: 38,
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
    webhookUrl: 'https://3commas.io/signal/wh/luna456abc',
    signalSource: 'LUNA',
    maxInvestmentPct: 80,
    volumePerEntryPct: 100,
    volumePerExitPct: 100,
    priceDeviationEntry: 1,
    priceDeviationExit: 1,
    takeProfit: 3.5,
    stopLoss: 7,
    totalPnl: 890,
    tradeCount: 61,
    signalsReceived: 74,
    signalsExecuted: 61,
    lastSignalTime: new Date(Date.now() - 22 * 60000),
    pnlHistory: makePnlHistory(600),
  },
];

// ── Seed Portfolio ─────────────────────────────────────────────────
export const SEED_PORTFOLIO: PortfolioAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.42, usdValue: 28240, allocation: 44.2, targetAllocation: 40, drift: 4.2, change24h: 2.3 },
  { symbol: 'ETH', name: 'Ethereum', balance: 8.1, usdValue: 19440, allocation: 30.4, targetAllocation: 30, drift: 0.4, change24h: -1.1 },
  { symbol: 'SOL', name: 'Solana', balance: 120, usdValue: 9600, allocation: 15.0, targetAllocation: 15, drift: 0, change24h: 4.7 },
  { symbol: 'BNB', name: 'BNB', balance: 14.2, usdValue: 5822, allocation: 9.1, targetAllocation: 10, drift: -0.9, change24h: 0.8 },
  { symbol: 'USDT', name: 'Tether', balance: 880, usdValue: 880, allocation: 1.4, targetAllocation: 5, drift: -3.6, change24h: 0 },
];

export const SEED_EXCHANGES: ExchangeConnection[] = [
  { id: 'ex1', name: 'Binance Main', type: 'Binance', mode: 'real', status: 'connected', totalBalance: 28240, apiKeyMasked: 'sk-Bn3f...a92x', lastSync: new Date(Date.now() - 45000) },
  { id: 'ex2', name: 'Bybit Trading', type: 'Bybit', mode: 'real', status: 'connected', totalBalance: 14400, apiKeyMasked: 'sk-By7k...c41z', lastSync: new Date(Date.now() - 120000) },
  { id: 'ex3', name: 'OKX Demo', type: 'OKX', mode: 'demo', status: 'connected', totalBalance: 10000, apiKeyMasked: 'sk-Ox9p...f88w', lastSync: new Date(Date.now() - 300000) },
];

export const SEED_SMART_TRADES: SmartTrade[] = [
  { id: 'st1', coinPair: 'BTC/USDT', exchange: 'Binance', direction: 'long', status: 'open', entryPrice: 66200, currentPrice: 67240, quantity: 0.05, takeProfitPct: 3, stopLossPct: 2, trailingStopPct: 1, trailingTPPct: 0.5, unrealizedPnl: 52, realizedPnl: 0, openedAt: new Date(Date.now() - 3600000) },
  { id: 'st2', coinPair: 'ETH/USDT', exchange: 'Bybit', direction: 'long', status: 'open', entryPrice: 3340, currentPrice: 3280, quantity: 2, takeProfitPct: 4, stopLossPct: 3, trailingStopPct: 0, trailingTPPct: 0, unrealizedPnl: -120, realizedPnl: 0, openedAt: new Date(Date.now() - 7200000) },
  { id: 'st3', coinPair: 'SOL/USDT', exchange: 'Binance', direction: 'short', status: 'closed', entryPrice: 82, currentPrice: 78, quantity: 10, takeProfitPct: 5, stopLossPct: 3, trailingStopPct: 1.5, trailingTPPct: 0, unrealizedPnl: 0, realizedPnl: 38, openedAt: new Date(Date.now() - 86400000) },
];

// ── Helpers ────────────────────────────────────────────────────────
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateNewSignal(): CryptoSignal {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ARB/USDT'];
  const indicators: CryptoSignal['indicator'][] = ['RSI', 'MACD', 'volume_spike', 'momentum'];
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const indicator = indicators[Math.floor(Math.random() * indicators.length)];
  const value = parseFloat(randomBetween(20, 90).toFixed(2));
  const threshold = indicator === 'RSI' ? 30 : indicator === 'volume_spike' ? 2.0 : indicator === 'MACD' ? 0.5 : 65;
  const triggered = value < threshold || (indicator === 'volume_spike' && value > threshold) || (indicator === 'momentum' && value > threshold);
  const severity: SignalSeverity = triggered ? (value < 25 || value > 85 ? 'critical' : 'warn') : 'info';
  return { id: `s${Date.now()}`, coinPair: pair, indicator, value, threshold, triggered, severity, timestamp: new Date() };
}
