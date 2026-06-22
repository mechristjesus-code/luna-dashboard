import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity, validateApiKey } from '@/lib/luna/store';
import type { ArbitrageBot, ArbitrageOpportunity } from '@/lib/luna/data';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

// GET /api/luna/arbitrage — list all arbitrage bots
export async function GET(req: NextRequest) {
  const key = req.headers.get('X-Luna-Key') ?? req.nextUrl.searchParams.get('key');
  if (!validateApiKey(key)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const bots = store.arbitrageBots;
  const totalPnl = bots.reduce((s, b) => s + b.totalPnl, 0);
  const totalTrades = bots.reduce((s, b) => s + b.tradeCount, 0);
  const totalOpportunities = bots.reduce((s, b) => s + b.opportunitiesDetected, 0);

  return NextResponse.json({
    success: true,
    count: bots.length,
    data: bots,
    meta: {
      totalPnl,
      totalTrades,
      totalOpportunities,
      running: bots.filter(b => b.status === 'running').length,
      avgWinRate: bots.length ? parseFloat((bots.reduce((s, b) => s + b.winRate, 0) / bots.length).toFixed(1)) : 0,
    },
  }, { headers: cors });
}

// POST /api/luna/arbitrage — create arbitrage bot
export async function POST(req: NextRequest) {
  const key = req.headers.get('X-Luna-Key') ?? req.nextUrl.searchParams.get('key');
  if (!validateApiKey(key)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.exchanges || !Array.isArray(body.exchanges) || body.exchanges.length < 2) {
    return NextResponse.json({ success: false, error: 'name and at least 2 exchanges are required' }, { status: 400, headers: cors });
  }

  const newBot: ArbitrageBot = {
    id: `arb${Date.now()}`,
    name: (body.name as string).toUpperCase(),
    coinPairs: body.coinPairs ?? ['BTC/USDT', 'ETH/USDT'],
    exchanges: body.exchanges,
    mode: body.mode ?? 'simulation',
    status: 'stopped',
    minSpreadPct: body.minSpreadPct ?? 0.1,
    maxInvestmentPerTrade: body.maxInvestmentPerTrade ?? 500,
    feePerSide: body.feePerSide ?? 0.1,
    executionDelayMs: body.executionDelayMs ?? 150,
    maxDailyTrades: body.maxDailyTrades ?? 50,
    maxDailyLoss: body.maxDailyLoss ?? 100,
    totalPnl: 0,
    tradeCount: 0,
    opportunitiesDetected: 0,
    opportunitiesExecuted: 0,
    avgSpreadCapture: 0,
    winRate: 0,
    pnlHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, pnl: 0 })),
    recentOpportunities: [],
  };

  store.arbitrageBots.push(newBot);
  addActivity({ eventType: 'ARB_CREATE', layer: 'V5', message: `Arbitrage bot "${newBot.name}" created on [${newBot.exchanges.join('/')}] [${newBot.mode.toUpperCase()}]`, severity: 'info' });

  return NextResponse.json({ success: true, data: newBot }, { status: 201, headers: cors });
}

// PATCH /api/luna/arbitrage — update bot status or config
export async function PATCH(req: NextRequest) {
  const key = req.headers.get('X-Luna-Key') ?? req.nextUrl.searchParams.get('key');
  if (!validateApiKey(key)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const body = await req.json().catch(() => ({}));
  const { id, action, ...patch } = body as { id: string; action?: string; [k: string]: unknown };

  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400, headers: cors });

  const idx = store.arbitrageBots.findIndex(b => b.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404, headers: cors });

  const bot = store.arbitrageBots[idx];

  // Handle action shortcuts
  if (action === 'start') {
    bot.status = 'running';
    addActivity({ eventType: 'ARB_STATUS', layer: 'V5', message: `Arbitrage bot "${bot.name}" → RUNNING`, severity: 'info' });
  } else if (action === 'pause') {
    bot.status = 'paused';
    addActivity({ eventType: 'ARB_STATUS', layer: 'V5', message: `Arbitrage bot "${bot.name}" → PAUSED`, severity: 'warn' });
  } else if (action === 'stop') {
    bot.status = 'stopped';
    addActivity({ eventType: 'ARB_STATUS', layer: 'V5', message: `Arbitrage bot "${bot.name}" → STOPPED`, severity: 'warn' });
  } else if (action === 'simulate_opportunity') {
    // Simulate detecting a new arbitrage opportunity
    const pairs = bot.coinPairs;
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const buyExchange = bot.exchanges[0];
    const sellExchange = bot.exchanges[1];
    const basePrice = pair.startsWith('BTC') ? 67240 : pair.startsWith('ETH') ? 3241 : 82;
    const spreadPct = parseFloat((Math.random() * 0.5 + 0.1).toFixed(3));
    const buyPrice = basePrice;
    const sellPrice = parseFloat((basePrice * (1 + spreadPct / 100)).toFixed(2));
    const estimatedProfit = parseFloat(((sellPrice - buyPrice) * (bot.maxInvestmentPerTrade / buyPrice) - (bot.feePerSide * 2 / 100 * bot.maxInvestmentPerTrade)).toFixed(2));

    const opp: ArbitrageOpportunity = {
      id: `ao${Date.now()}`,
      coinPair: pair,
      buyExchange,
      sellExchange,
      buyPrice,
      sellPrice,
      spreadPct,
      estimatedProfit,
      status: estimatedProfit > 0 ? 'completed' : 'missed',
      detectedAt: new Date(),
    };

    bot.recentOpportunities = [opp, ...bot.recentOpportunities].slice(0, 20);
    bot.opportunitiesDetected++;
    if (estimatedProfit > 0) {
      bot.opportunitiesExecuted++;
      bot.tradeCount++;
      bot.totalPnl = parseFloat((bot.totalPnl + estimatedProfit).toFixed(2));
      bot.pnlHistory.push({ time: `${bot.pnlHistory.length}h`, pnl: bot.totalPnl });
      if (bot.pnlHistory.length > 48) bot.pnlHistory = bot.pnlHistory.slice(-48);
      addActivity({ eventType: 'ARB_TRADE', layer: 'V5', message: `ARB "${bot.name}" captured ${pair} spread ${buyExchange}/${sellExchange} +${spreadPct}% · Profit: $${estimatedProfit}`, severity: 'live' });
    }

    return NextResponse.json({ success: true, opportunity: opp, bot: store.arbitrageBots[idx] }, { headers: cors });
  }

  // Apply allowed field patches
  const allowed = ['name', 'status', 'mode', 'minSpreadPct', 'maxInvestmentPerTrade', 'feePerSide', 'executionDelayMs', 'maxDailyTrades', 'maxDailyLoss', 'coinPairs', 'exchanges'];
  for (const k of allowed) {
    if (k in patch) (bot as Record<string, unknown>)[k] = patch[k];
  }

  return NextResponse.json({ success: true, data: store.arbitrageBots[idx] }, { headers: cors });
}

// DELETE /api/luna/arbitrage?id=arb1
export async function DELETE(req: NextRequest) {
  const key = req.headers.get('X-Luna-Key') ?? req.nextUrl.searchParams.get('key');
  if (!validateApiKey(key)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400, headers: cors });

  const idx = store.arbitrageBots.findIndex(b => b.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404, headers: cors });

  const [removed] = store.arbitrageBots.splice(idx, 1);
  addActivity({ eventType: 'ARB_DELETE', layer: 'V5', message: `Arbitrage bot "${removed.name}" deleted`, severity: 'warn' });

  return NextResponse.json({ success: true, deleted: id }, { headers: cors });
}
