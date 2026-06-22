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

// GET /api/luna/bots/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bot = store.bots.find(b => b.id === id);
  if (!bot) return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404, headers: cors });
  return NextResponse.json({ success: true, data: bot }, { headers: cors });
}

// PATCH /api/luna/bots/:id — partial update (status, mode, virtualBalance, etc.)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = store.bots.findIndex(b => b.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404, headers: cors });

  const body = await req.json().catch(() => ({}));
  const allowed = ['name', 'status', 'mode', 'virtualBalance', 'totalPnl', 'tradeCount', 'strategy'];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  // Validate mode transition
  if (patch.mode === 'live' && store.bots[idx].mode !== 'live') {
    addActivity({ eventType: 'BOT_LIVE', layer: 'V5', message: `⚡ Bot "${store.bots[idx].name}" switched to LIVE mode`, severity: 'live' });
  }
  if (patch.status) {
    addActivity({ eventType: 'BOT_STATUS', layer: 'V5', message: `Bot "${store.bots[idx].name}" → ${String(patch.status).toUpperCase()}`, severity: 'info' });
  }

  store.bots[idx] = { ...store.bots[idx], ...patch };
  return NextResponse.json({ success: true, data: store.bots[idx] }, { headers: cors });
}

// DELETE /api/luna/bots/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = store.bots.findIndex(b => b.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404, headers: cors });
  const [removed] = store.bots.splice(idx, 1);
  addActivity({ eventType: 'BOT_DELETE', layer: 'V5', message: `Bot "${removed.name}" deleted`, severity: 'warn' });
  return NextResponse.json({ success: true, deleted: id }, { headers: cors });
}
