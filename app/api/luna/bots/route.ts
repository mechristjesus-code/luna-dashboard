import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

// GET /api/luna/bots — list all bots
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  const status = searchParams.get('status');

  let bots = store.bots;
  if (mode) bots = bots.filter(b => b.mode === mode);
  if (status) bots = bots.filter(b => b.status === status);

  return NextResponse.json({
    success: true,
    count: bots.length,
    data: bots,
    meta: {
      totalPnl: bots.reduce((s, b) => s + b.totalPnl, 0),
      running: bots.filter(b => b.status === 'running').length,
      live: bots.filter(b => b.mode === 'live').length,
    },
  }, { headers: cors });
}

// POST /api/luna/bots — create bot
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.coinPair) {
    return NextResponse.json({ success: false, error: 'name and coinPair are required' }, { status: 400, headers: cors });
  }
  const newBot = {
    id: `b${Date.now()}`,
    name: (body.name as string).toUpperCase(),
    coinPair: body.coinPair,
    strategy: body.strategy ?? 'Custom',
    mode: body.mode ?? 'simulation',
    status: 'stopped' as const,
    virtualBalance: body.virtualBalance ?? 10000,
    totalPnl: 0,
    tradeCount: 0,
    pnlHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, pnl: 0 })),
  };
  store.bots.push(newBot);
  addActivity({ eventType: 'BOT_CREATE', layer: 'V5', message: `Bot "${newBot.name}" created on ${newBot.coinPair} [${newBot.mode.toUpperCase()}]`, severity: 'info' });
  return NextResponse.json({ success: true, data: newBot }, { status: 201, headers: cors });
}
