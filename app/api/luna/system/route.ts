import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'online',
      version: '1.0.0',
      layers: [
        { version: 'V1', name: 'Signal Ingestion', status: 'online' },
        { version: 'V2', name: 'Pattern Recognition', status: 'online' },
        { version: 'V3', name: 'Memory & Context', status: 'processing' },
        { version: 'V4', name: 'Strategy Engine', status: 'online' },
        { version: 'V5', name: 'Execution Agent', status: 'online' },
        { version: 'V6', name: 'Risk Controller', status: 'idle' },
        { version: 'V7', name: 'Monetization Engine', status: 'processing' },
        { version: 'V8', name: 'Company Factory', status: 'online' },
        { version: 'V9', name: 'Deployment Gateway', status: 'online' },
        { version: 'V10', name: 'SaaS Marketplace', status: 'online' },
        { version: 'V11', name: 'Global Stack', status: 'idle' },
        { version: 'V12', name: 'Ecosystem Engine', status: 'processing' },
      ],
      metrics: {
        activeBots: store.bots.filter(b => b.status === 'running').length,
        liveBots: store.bots.filter(b => b.mode === 'live').length,
        activeSignals: store.signals.filter(s => s.triggered).length,
        totalPnl: store.bots.reduce((s, b) => s + b.totalPnl, 0),
        portfolioValue: store.portfolio.reduce((s, a) => s + a.usdValue, 0),
        strategies: store.strategies.length,
        systemHealth: 94,
      },
      settings: store.settings,
      timestamp: new Date().toISOString(),
    },
  }, { headers: cors });
}

// POST /api/luna/system — update settings
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, error: 'body required' }, { status: 400, headers: cors });
  store.settings = { ...store.settings, ...body };
  addActivity({ eventType: 'SYSTEM', layer: 'V1', message: `System settings updated via API`, severity: 'info' });
  return NextResponse.json({ success: true, settings: store.settings }, { headers: cors });
}
