// ── LUNA In-Memory Store ───────────────────────────────────────────
// Shared mutable state for all API routes (resets on server restart).
// In production, replace with a real DB via drizzle.

import type { TradingBot, TradingStrategy, CryptoSignal, DCABot, GridBot, SignalBot, PortfolioAsset, ActivityLogEntry } from './data';

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
  { id: 'b1', name: 'ALPHA-1', coinPair: 'BTC/USDT', strategy: 'RSI Reversal v2', mode: 'simulation', status: 'running', virtualBalance: 11240, totalPnl: 1240, tradeCount: 47, pnlHistory: makePnlHistory(0) },
  { id: 'b2', name: 'BETA-X', coinPair: 'ETH/USDT', strategy: 'MACD Crossover', mode: 'simulation', status: 'running', virtualBalance: 9820, totalPnl: -180, tradeCount: 33, pnlHistory: makePnlHistory(-100) },
  { id: 'b3', name: 'GAMMA-3', coinPair: 'SOL/USDT', strategy: 'Volume Breakout', mode: 'live', status: 'running', virtualBalance: 15600, totalPnl: 5600, tradeCount: 89, pnlHistory: makePnlHistory(300) },
  { id: 'b4', name: 'DELTA-9', coinPair: 'ARB/USDT', strategy: 'Momentum Surf', mode: 'simulation', status: 'paused', virtualBalance: 9950, totalPnl: -50, tradeCount: 12, pnlHistory: makePnlHistory(-50) },
];

const initStrategies: TradingStrategy[] = [
  { id: 'st1', name: 'RSI Reversal v2', signalConditions: 'RSI < 30 + Volume > 1.5x avg', status: 'active', winRate: 68, maxDrawdown: 8.4, tradeCount: 182, pnlCurve: makePnlCurve(40) },
  { id: 'st2', name: 'MACD Crossover', signalConditions: 'MACD crossover + Momentum > 60', status: 'active', winRate: 61, maxDrawdown: 12.1, tradeCount: 144, pnlCurve: makePnlCurve(20) },
  { id: 'st3', name: 'Volume Breakout', signalConditions: 'Volume spike > 2x + Price momentum > 65', status: 'active', winRate: 74, maxDrawdown: 6.2, tradeCount: 97, pnlCurve: makePnlCurve(60) },
  { id: 'st4', name: 'Momentum Surf', signalConditions: 'Momentum > 70 + RSI 50–65 zone', status: 'draft', winRate: 55, maxDrawdown: 15.8, tradeCount: 34, pnlCurve: makePnlCurve(10) },
];

const initSignals: CryptoSignal[] = [
  { id: 's1', coinPair: 'BTC/USDT', indicator: 'RSI', value: 28.4, threshold: 30, triggered: true, severity: 'critical', timestamp: new Date(Date.now() - 12000) },
  { id: 's2', coinPair: 'ETH/USDT', indicator: 'volume_spike', value: 3.4, threshold: 2.0, triggered: true, severity: 'warn', timestamp: new Date(Date.now() - 95000) },
  { id: 's3', coinPair: 'SOL/USDT', indicator: 'MACD', value: 0.82, threshold: 0.5, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 180000) },
  { id: 's4', coinPair: 'BNB/USDT', indicator: 'momentum', value: 72.1, threshold: 65, triggered: true, severity: 'info', timestamp: new Date(Date.now() - 240000) },
];

const initPortfolio: PortfolioAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.42, usdValue: 28240, allocation: 44.2, targetAllocation: 40, drift: 4.2, change24h: 2.3 },
  { symbol: 'ETH', name: 'Ethereum', balance: 8.1, usdValue: 19440, allocation: 30.4, targetAllocation: 30, drift: 0.4, change24h: -1.1 },
  { symbol: 'SOL', name: 'Solana', balance: 120, usdValue: 9600, allocation: 15.0, targetAllocation: 15, drift: 0, change24h: 4.7 },
  { symbol: 'BNB', name: 'BNB', balance: 14.2, usdValue: 5822, allocation: 9.1, targetAllocation: 10, drift: -0.9, change24h: 0.8 },
  { symbol: 'USDT', name: 'Tether', balance: 880, usdValue: 880, allocation: 1.4, targetAllocation: 5, drift: -3.6, change24h: 0 },
];

const initActivity: ActivityLogEntry[] = [
  { id: '1', eventType: 'SIGNAL', layer: 'V2', message: 'RSI alert on BTC/USDT — value: 28.4', severity: 'critical', timestamp: new Date(Date.now() - 12000) },
  { id: '2', eventType: 'BOT', layer: 'V5', message: 'ALPHA-1 executed BUY 0.05 BTC @ $67,240 [SIM]', severity: 'info', timestamp: new Date(Date.now() - 28000) },
  { id: '3', eventType: 'STRATEGY', layer: 'V4', message: 'Strategy "RSI Reversal v2" backtest complete — Win rate: 68%', severity: 'info', timestamp: new Date(Date.now() - 130000) },
];

// ── Global store singleton ─────────────────────────────────────────
const g = globalThis as typeof globalThis & {
  _lunaStore?: {
    bots: TradingBot[];
    strategies: TradingStrategy[];
    signals: CryptoSignal[];
    portfolio: PortfolioAsset[];
    activity: ActivityLogEntry[];
    settings: Record<string, unknown>;
    termuxCode: string[];
  };
};

if (!g._lunaStore) {
  g._lunaStore = {
    bots: initBots,
    strategies: initStrategies,
    signals: initSignals,
    portfolio: initPortfolio,
    activity: initActivity,
    settings: {
      apiKey: 'luna-api-key-' + Math.random().toString(36).slice(2, 10),
      version: '1.0.0',
      mode: 'simulation',
      autoRefresh: true,
    },
    termuxCode: [],
  };
}

export const store = g._lunaStore!;

export function addActivity(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) {
  store.activity.unshift({
    ...entry,
    id: `a${Date.now()}`,
    timestamp: new Date(),
  });
  if (store.activity.length > 200) store.activity = store.activity.slice(0, 200);
}
