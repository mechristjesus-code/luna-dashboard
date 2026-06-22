import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  let s = store.strategies;
  if (status) s = s.filter(x => x.status === status);
  return NextResponse.json({ success: true, count: s.length, data: s }, { headers: cors });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ success: false, error: 'name required' }, { status: 400, headers: cors });
  const s = {
    id: `st${Date.now()}`,
    name: body.name,
    signalConditions: body.signalConditions ?? '',
    status: body.status ?? 'draft',
    winRate: body.winRate ?? 0,
    maxDrawdown: body.maxDrawdown ?? 0,
    tradeCount: body.tradeCount ?? 0,
    pnlCurve: body.pnlCurve ?? [],
  };
  store.strategies.push(s as typeof store.strategies[0]);
  addActivity({ eventType: 'STRATEGY', layer: 'V4', message: `Strategy "${s.name}" created [${s.status}]`, severity: 'info' });
  return NextResponse.json({ success: true, data: s }, { status: 201, headers: cors });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400, headers: cors });
  const idx = store.strategies.findIndex(s => s.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404, headers: cors });
  store.strategies[idx] = { ...store.strategies[idx], ...body };
  return NextResponse.json({ success: true, data: store.strategies[idx] }, { headers: cors });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400, headers: cors });
  store.strategies = store.strategies.filter(s => s.id !== id);
  return NextResponse.json({ success: true, deleted: id }, { headers: cors });
}
