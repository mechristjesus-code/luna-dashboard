import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';
import type { CryptoSignal } from '@/lib/luna/data';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key, X-TradingView-Secret',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

/**
 * POST /api/luna/webhook
 * Accepts TradingView-style webhook payloads and injects them as CryptoSignals.
 *
 * Expected body (TradingView format):
 * {
 *   "ticker": "BTCUSDT",
 *   "action": "buy" | "sell",
 *   "price": 67240,
 *   "indicator": "RSI",
 *   "value": 28.4,
 *   "threshold": 30,
 *   "confidence": 85,
 *   "sentiment": "bullish" | "bearish" | "neutral",
 *   "source": "TradingView" | "Custom" | "LUNA",
 *   "secret": "optional-webhook-secret"
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400, headers: cors });
  }

  // Optional secret validation
  const providedSecret = req.headers.get('X-TradingView-Secret') ?? body.secret;
  const configuredSecret = store.settings.webhookSecret as string | undefined;
  if (configuredSecret && providedSecret !== configuredSecret) {
    return NextResponse.json({ success: false, error: 'Invalid webhook secret' }, { status: 401, headers: cors });
  }

  // Normalize ticker to PAIR format (e.g. BTCUSDT → BTC/USDT)
  const rawTicker = (body.ticker ?? body.symbol ?? 'BTC/USDT') as string;
  const coinPair = rawTicker.includes('/') ? rawTicker : rawTicker.replace(/(USDT|BTC|ETH|BNB)$/, '/$1');

  // Map action to indicator/severity
  const indicator = (body.indicator ?? (body.action === 'buy' ? 'RSI' : 'momentum')) as CryptoSignal['indicator'];
  const value = typeof body.value === 'number' ? body.value : (body.action === 'buy' ? 28.4 : 72.1);
  const threshold = typeof body.threshold === 'number' ? body.threshold : (body.action === 'buy' ? 30 : 70);
  const triggered = body.triggered !== undefined ? Boolean(body.triggered) : true;

  const sentimentRaw = (body.sentiment ?? 'neutral') as string;
  const sentimentScore = sentimentRaw === 'bullish' ? 0.75 : sentimentRaw === 'bearish' ? -0.75 : 0;
  const sentimentLabel: CryptoSignal['sentimentLabel'] = sentimentRaw === 'bullish' ? 'Bullish' : sentimentRaw === 'bearish' ? 'Bearish' : 'Neutral';
  const confidence = typeof body.confidence === 'number' ? body.confidence : 70;

  const severity: CryptoSignal['severity'] =
    (body.severity as CryptoSignal['severity']) ??
    (confidence >= 85 ? 'critical' : confidence >= 65 ? 'warn' : 'info');

  const signal: CryptoSignal = {
    id: `wh${Date.now()}`,
    coinPair,
    indicator,
    value,
    threshold,
    triggered,
    severity,
    timestamp: new Date(),
    sentimentScore,
    sentimentLabel,
    source: (body.source ?? 'Webhook') as CryptoSignal['source'],
    confidence,
  };

  // Prepend to signals store (keep last 100)
  store.signals.unshift(signal);
  if (store.signals.length > 100) store.signals = store.signals.slice(0, 100);

  addActivity({
    eventType: 'WEBHOOK',
    layer: 'V1',
    message: `Webhook received: ${coinPair} ${indicator} = ${value} (${sentimentLabel}, ${confidence}% confidence) [${signal.source}]`,
    severity: severity === 'critical' ? 'critical' : severity === 'warn' ? 'warn' : 'info',
  });

  // Check if any signal bots should be triggered
  const triggeredBots: string[] = [];
  if (triggered) {
    for (const bot of store.signals) {
      // This is a simplified trigger check — in production, match bot.coinPair and confidence filters
      void bot; // placeholder
    }
  }

  return NextResponse.json({
    success: true,
    signal,
    triggeredBots,
    message: `Signal injected: ${coinPair} ${indicator} @ ${value}`,
  }, { status: 201, headers: cors });
}

// GET /api/luna/webhook — list recent webhook-sourced signals
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20');
  const webhookSignals = store.signals
    .filter(s => s.source === 'Webhook' || s.source === 'TradingView')
    .slice(0, Math.min(limit, 50));

  return NextResponse.json({
    success: true,
    count: webhookSignals.length,
    data: webhookSignals,
    webhookUrl: '/api/luna/webhook',
    instructions: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-TradingView-Secret': '<your-secret>' },
      body: {
        ticker: 'BTCUSDT',
        action: 'buy',
        indicator: 'RSI',
        value: 28.4,
        threshold: 30,
        confidence: 85,
        sentiment: 'bullish',
        source: 'TradingView',
      },
    },
  }, { headers: cors });
}
