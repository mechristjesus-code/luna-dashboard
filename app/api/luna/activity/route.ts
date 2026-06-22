import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get('severity');
  const layer = searchParams.get('layer');
  const limit = parseInt(searchParams.get('limit') ?? '50');
  let logs = store.activity;
  if (severity) logs = logs.filter(l => l.severity === severity);
  if (layer) logs = logs.filter(l => l.layer === layer);
  return NextResponse.json({ success: true, count: logs.length, data: logs.slice(0, limit) }, { headers: cors });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.message) return NextResponse.json({ success: false, error: 'message required' }, { status: 400, headers: cors });
  addActivity({ eventType: body.eventType ?? 'CUSTOM', layer: body.layer ?? 'V1', message: body.message, severity: body.severity ?? 'info' });
  return NextResponse.json({ success: true }, { status: 201, headers: cors });
}

export async function DELETE() {
  store.activity = [];
  return NextResponse.json({ success: true, cleared: true }, { headers: cors });
}
