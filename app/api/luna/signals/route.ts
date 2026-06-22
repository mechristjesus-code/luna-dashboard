import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

// GET /api/luna/signals — list signals, optional ?triggered=true&pair=BTC/USDT
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const triggered = searchParams.get('triggered');
  const pair = searchParams.get('pair');
  const indicator = searchParams.get('indicator');
  const severity = searchParams.get('severity');
  const limit = parseInt(searchParams.get('limit') ?? '50');

  let signals = store.signals;
  if (triggered === 'true') signals = signals.filter(s => s.triggered);
  if (pair) signals = signals.filter(s => s.coinPair.toLowerCase() === pair.toLowerCase());
  if (indicator) signals = signals.filter(s => s.indicator === indicator);
  if (severity) signals = signals.filter(s => s.severity === severity);

  return NextResponse.json({
    success: true,
    count: signals.length,
    data: signals.slice(0, limit),
    meta: {
      critical: signals.filter(s => s.severity === 'critical').length,
      triggered: signals.filter(s => s.triggered).length,
    },
  }, { headers: cors });
}

// POST /api/luna/signals — inject a new signal (from Termux / TradingView webhook)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.coinPair || !body.indicator) {
    return NextResponse.json({ success: false, error: 'coinPair and indicator required' }, { status: 400, headers: cors });
  }
  const sig = {
    id: `s${Date.now()}`,
    coinPair: body.coinPair,
    indicator: body.indicator,
    value: body.value ?? 0,
    threshold: body.threshold ?? 30,
    triggered: body.triggered ?? false,
    severity: body.severity ?? 'info',
    timestamp: new Date(),
  };
  store.signals.unshift(sig as typeof store.signals[0]);
  if (store.signals.length > 100) store.signals = store.signals.slice(0, 100);
  if (sig.triggered) {
    addActivity({ eventType: 'SIGNAL', layer: 'V2', message: `${sig.indicator} alert on ${sig.coinPair} — value: ${sig.value}`, severity: sig.severity as 'info' | 'warn' | 'critical' });
  }
  return NextResponse.json({ success: true, data: sig }, { status: 201, headers: cors });
}

// DELETE /api/luna/signals — clear all signals
export async function DELETE() {
  store.signals = [];
  return NextResponse.json({ success: true, cleared: true }, { headers: cors });
}
