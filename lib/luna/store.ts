// ── LUNA In-Memory Store ───────────────────────────────────────────
// Shared mutable state for all API routes (resets on server restart).
// UPGRADED v2.0: ArbitrageBot, enhanced DCA/Grid/Signal, API key auth, master control
// In production, replace with a real DB via drizzle.

import type {
  TradingBot, TradingStrategy, CryptoSignal,
  DCABot, GridBot, SignalBot, ArbitrageBot,
  PortfolioAsset, ActivityLogEntry,
} from './data';

function makePnlHistory(base: number, steps = 24) {
  return Array.from({ length: steps }, (_, i) => ({
    time: `${i}h`,
    pnl: parseFloat((base + (Math.random() - 0.44) * 200 * ((i + 1) / steps)).toFixed(2)),
  }));
}

function makePnlCurve(trend: number) {
  return Array.from({ length: 30 }, (_, i) => ({
    time: `D${i + 1}`,
    pnl: parseFloat((trend * i + (Math.random() - 0.4) * 150).toFixed(2)),
  }));
}

// ── Initial state ──────────────────────────────────────────────────

const initBots: TradingBot[] = [
  { id: 'b1', name: 'ALPHA-1', coinPair: 'BTC/USDT', strategy: 'RSI Reversal v2', mode: 'simulation', status: 'running', virtualBalance: 11240, totalPnl: 1240, tradeCount: 47, winRate: 68, maxDrawdown: 8.4, sharpeRatio: 1.84, pnlHistory: makePnlHistory(0) },
  { id: 'b2', name: 'BETA-X', coinPair: 'ETH/USDT', strategy: 'MACD Crossover', mode: 'simulation', status: 'running', virtualBalance: 9820, totalPnl: -180, tradeCount: 33, winRate: 48, maxDrawdown: 14.2, sharpeRatio: 0.62, pnlHistory: makePnlHistory(-100) },
  { id: 'b3', name: 'GAMMA-3', coinPair: 'SOL/USDT', strategy: 'Volume Breakout', mode: 'live', status: 'running', virtualBalance: 15600, totalPnl: 5600, tradeCount: 89, winRate: 74, maxDrawdown: 6.2, sharpeRatio: 2.41, pnlHistory: makePnlHistory(300) },
  { id: 'b4', name: 'DELTA-9', coinPair: 'ARB/USDT', strategy: 'Momentum Surf', mode: 'simulation', status: 'paused', virtualBalance: 9950, totalPnl: -50, tradeCount: 12, winRate: 55, maxDrawdown: 15.8, sharpeRatio: 0.88, pnlHistory: makePnlHistory(-50) },
  { id: 'b5', name: 'OMEGA-7', coinPair: 'BNB/USDT', strategy: 'Composite AI', mode: 'simulation', status: 'running', virtualBalance: 12800, totalPnl: 2800, tradeCount: 64, winRate: 71, maxDrawdown: 7.1, sharpeRatio: 2.12, pnlHistory: makePnlHistory(150) },
];

const initStrategies: TradingStrategy[] = [
  { id: 'st1', name: 'RSI Reversal v2', signalConditions: 'RSI < 30 + Volume > 1.5x avg', status: 'active', winRate: 68, maxDrawdown: 8.4, tradeCount: 182, pnlCurve: makePnlCurve(40), riskLevel: 'Medium', timeframe: '15m', sharpeRatio: 1.84 },
  { id: 'st2', name: 'MACD Crossover', signalConditions: 'MACD crossover + Momentum > 60', status: 'active', winRate: 61, maxDrawdown: 12.1, tradeCount: 144, pnlCurve: makePnlCurve(20), riskLevel: 'Medium', timeframe: '1h', sharpeRatio: 1.21 },
  { id: 'st3', name: 'Volume Breakout', signalConditions: 'Volume spike > 2x + Price momentum > 65', status: 'active', winRate: 74, maxDrawdown: 6.2, tradeCount: 97, pnlCurve: makePnlCurve(60), riskLevel: 'Low', timeframe: '4h', sharpeRatio: 2.41 },
  { id: 'st4', name: 'Momentum Surf', signalConditions: 'Momentum > 70 + RSI 50–65 zone', status: 'draft', winRate: 55, maxDrawdown: 15.8, tradeCount: 34, pnlCurve: makePnlCurve(10), riskLevel: 'High', timeframe: '1h', sharpeRatio: 0.88 },
  { id: 'st5', name: 'Composite AI Signal', signalConditions: 'RSI + MACD + Sentiment + Volume composite score > 75', status: 'active', winRate: 79, maxDrawdown: 5.1, tradeCount: 58, pnlCurve: makePnlCurve(80), riskLevel: 'Low', timeframe: '1h', sharpeRatio: 3.12 },
];

const initSignals: CryptoSignal[] = [
  { id: 's1', coinPair: 'BTC/USDT', indicator: 'RSI', value: 28.4, threshold: 30, triggered: true, severity: 'critical', timestamp: new Date(Date.now() - 12000), sentimentScore: 0.72, sentimentLabel: 'Bullish', source: 'LUNA', confidence: 91 },
  { id: 's2', coinPair: 'ETH/USDT', indicator: 'volume_spike', value: 3.4, threshold: 2.0, triggered: true, severity: 'warn', timestamp: new Date(Date.now() - 95000), sentimentScore: 0.41, sentimentLabel: 'Bullish', source: 'On-Chain', confidence: 74 },
  { id: 's3', coinPair: 'SOL/USDT', indicator: 'MACD', value: 0.82, threshold: 0.5, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 180000), sentimentScore: 0.18, sentimentLabel: 'Neutral', source: 'TradingView', confidence: 62 },
  { id: 's4', coinPair: 'BNB/USDT', indicator: 'momentum', value: 72.1, threshold: 65, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 240000), sentimentScore: 0.55, sentimentLabel: 'Bullish', source: 'LUNA', confidence: 80 },
  { id: 's5', coinPair: 'BTC/USDT', indicator: 'whale_alert', value: 12400, threshold: 5000, triggered: true, severity: 'warn', timestamp: new Date(Date.now() - 900000), sentimentScore: 0.35, sentimentLabel: 'Bullish', source: 'On-Chain', confidence: 88 },
];

const initPortfolio: PortfolioAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.42, usdValue: 28240, allocation: 44.2, targetAllocation: 40, drift: 4.2, change24h: 2.3, volatility30d: 38.4, beta: 1.0, riskScore: 62 },
  { symbol: 'ETH', name: 'Ethereum', balance: 8.1, usdValue: 19440, allocation: 30.4, targetAllocation: 30, drift: 0.4, change24h: -1.1, volatility30d: 44.2, beta: 1.18, riskScore: 68 },
  { symbol: 'SOL', name: 'Solana', balance: 120, usdValue: 9600, allocation: 15.0, targetAllocation: 15, drift: 0, change24h: 4.7, volatility30d: 62.8, beta: 1.42, riskScore: 75 },
  { symbol: 'BNB', name: 'BNB', balance: 14.2, usdValue: 5822, allocation: 9.1, targetAllocation: 10, drift: -0.9, change24h: 0.8, volatility30d: 31.2, beta: 0.88, riskScore: 54 },
  { symbol: 'USDT', name: 'Tether', balance: 880, usdValue: 880, allocation: 1.4, targetAllocation: 5, drift: -3.6, change24h: 0, volatility30d: 0.1, beta: 0.0, riskScore: 5 },
];

const initActivity: ActivityLogEntry[] = [
  { id: '1', eventType: 'SIGNAL', layer: 'V2', message: 'RSI alert on BTC/USDT — value: 28.4 · Sentiment: Bullish 91%', severity: 'critical', timestamp: new Date(Date.now() - 12000) },
  { id: '2', eventType: 'BOT', layer: 'V5', message: 'ALPHA-1 executed BUY 0.05 BTC @ $67,240 [SIM] · Composite: 92/100', severity: 'info', timestamp: new Date(Date.now() - 28000) },
  { id: '3', eventType: 'ARBITRAGE', layer: 'V5', message: 'ARB-BOT-1 captured BTC spread Binance/Bybit +0.12% · Profit: $3.80', severity: 'live', timestamp: new Date(Date.now() - 35000) },
  { id: '4', eventType: 'STRATEGY', layer: 'V4', message: 'Strategy "RSI Reversal v2" backtest complete — Win rate: 68% · Sharpe: 1.84', severity: 'info', timestamp: new Date(Date.now() - 130000) },
  { id: '5', eventType: 'RISK', layer: 'V6', message: 'Portfolio risk score elevated to 72/100 — BTC allocation drift +4.2%', severity: 'warn', timestamp: new Date(Date.now() - 280000) },
];

const initArbitrageBots: ArbitrageBot[] = [
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
    recentOpportunities: [
      { id: 'ao1', coinPair: 'BTC/USDT', buyExchange: 'Binance', sellExchange: 'Bybit', buyPrice: 67240, sellPrice: 67318, spreadPct: 0.116, estimatedProfit: 3.80, status: 'completed', detectedAt: new Date(Date.now() - 35000) },
      { id: 'ao2', coinPair: 'ETH/USDT', buyExchange: 'OKX', sellExchange: 'Binance', buyPrice: 3241, sellPrice: 3256, spreadPct: 0.463, estimatedProfit: 11.20, status: 'completed', detectedAt: new Date(Date.now() - 120000) },
    ],
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

// ── API Key Registry ───────────────────────────────────────────────
const initApiKeys: Record<string, { label: string; createdAt: Date; lastUsed: Date | null; callCount: number }> = {};
const defaultKey = 'luna-key-' + Math.random().toString(36).slice(2, 12);
initApiKeys[defaultKey] = { label: 'Default Key', createdAt: new Date(), lastUsed: null, callCount: 0 };

// ── Global store singleton ─────────────────────────────────────────
const g = globalThis as typeof globalThis & {
  _lunaStore?: {
    bots: TradingBot[];
    strategies: TradingStrategy[];
    signals: CryptoSignal[];
    portfolio: PortfolioAsset[];
    activity: ActivityLogEntry[];
    arbitrageBots: ArbitrageBot[];
    settings: Record<string, unknown>;
    apiKeys: Record<string, { label: string; createdAt: Date; lastUsed: Date | null; callCount: number }>;
    termuxCode: string[];
    // Master control
    masterStatus: 'running' | 'paused' | 'stopped';
  };
};

if (!g._lunaStore) {
  g._lunaStore = {
    bots: initBots,
    strategies: initStrategies,
    signals: initSignals,
    portfolio: initPortfolio,
    activity: initActivity,
    arbitrageBots: initArbitrageBots,
    settings: {
      apiKey: defaultKey,
      version: '2.0.0',
      mode: 'simulation',
      autoRefresh: true,
      apiKeyRequired: false,   // set to true to enforce API key auth
      webhookEnabled: true,
      sentimentEnabled: true,
    },
    apiKeys: initApiKeys,
    termuxCode: [],
    masterStatus: 'running',
  };
}

export const store = g._lunaStore!;

export function addActivity(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) {
  store.activity.unshift({
    ...entry,
    id: `a${Date.now()}`,
    timestamp: new Date(),
  });
  if (store.activity.length > 500) store.activity = store.activity.slice(0, 500);
}

// ── Master Control ─────────────────────────────────────────────────
export function masterPauseAll() {
  store.bots.forEach(b => { if (b.status === 'running') b.status = 'paused'; });
  store.arbitrageBots.forEach(b => { if (b.status === 'running') b.status = 'paused'; });
  store.masterStatus = 'paused';
  addActivity({ eventType: 'MASTER', layer: 'V5', message: '⏸ MASTER PAUSE — All bots paused', severity: 'warn' });
}

export function masterResumeAll() {
  store.bots.forEach(b => { if (b.status === 'paused') b.status = 'running'; });
  store.arbitrageBots.forEach(b => { if (b.status === 'paused') b.status = 'running'; });
  store.masterStatus = 'running';
  addActivity({ eventType: 'MASTER', layer: 'V5', message: '▶ MASTER RESUME — All bots resumed', severity: 'info' });
}

export function masterStopAll() {
  store.bots.forEach(b => { b.status = 'stopped'; });
  store.arbitrageBots.forEach(b => { b.status = 'stopped'; });
  store.masterStatus = 'stopped';
  addActivity({ eventType: 'MASTER', layer: 'V5', message: '■ MASTER STOP — All bots stopped', severity: 'critical' });
}

// ── API Key Validation ─────────────────────────────────────────────
export function validateApiKey(key: string | null): boolean {
  if (!store.settings.apiKeyRequired) return true;
  if (!key) return false;
  const record = store.apiKeys[key];
  if (!record) return false;
  record.lastUsed = new Date();
  record.callCount++;
  return true;
}

export function issueApiKey(label: string): string {
  const key = 'luna-key-' + Math.random().toString(36).slice(2, 12);
  store.apiKeys[key] = { label, createdAt: new Date(), lastUsed: null, callCount: 0 };
  addActivity({ eventType: 'API_KEY', layer: 'V9', message: `API key issued: "${label}"`, severity: 'info' });
  return key;
}
