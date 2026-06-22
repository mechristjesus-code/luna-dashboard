import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

export async function GET() {
  const total = store.portfolio.reduce((s, a) => s + a.usdValue, 0);
  return NextResponse.json({
    success: true,
    data: store.portfolio,
    meta: {
      totalUsd: total,
      assetCount: store.portfolio.length,
      bestPerformer: [...store.portfolio].sort((a, b) => b.change24h - a.change24h)[0]?.symbol,
      worstPerformer: [...store.portfolio].sort((a, b) => a.change24h - b.change24h)[0]?.symbol,
    },
  }, { headers: cors });
}

// POST /api/luna/portfolio — update/add an asset
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.symbol) return NextResponse.json({ success: false, error: 'symbol required' }, { status: 400, headers: cors });
  const idx = store.portfolio.findIndex(a => a.symbol === body.symbol);
  if (idx !== -1) {
    store.portfolio[idx] = { ...store.portfolio[idx], ...body };
    return NextResponse.json({ success: true, data: store.portfolio[idx] }, { headers: cors });
  }
  const asset = { symbol: body.symbol, name: body.name ?? body.symbol, balance: body.balance ?? 0, usdValue: body.usdValue ?? 0, allocation: 0, targetAllocation: body.targetAllocation ?? 0, drift: 0, change24h: body.change24h ?? 0 };
  store.portfolio.push(asset);
  return NextResponse.json({ success: true, data: asset }, { status: 201, headers: cors });
}
