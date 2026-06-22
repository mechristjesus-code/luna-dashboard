import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

// Admin key check — in production use a real secret
const ADMIN_KEY = process.env.LUNA_ADMIN_KEY ?? 'luna-admin-dev';

function checkAuth(req: NextRequest): boolean {
  const key = req.headers.get('X-Luna-Key') ?? req.headers.get('authorization')?.replace('Bearer ', '');
  return key === ADMIN_KEY;
}

// GET /api/admin — status + admin info
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ success: false, error: 'Unauthorized. Set X-Luna-Key header.' }, { status: 401, headers: cors });
  return NextResponse.json({
    success: true,
    admin: true,
    store_summary: {
      bots: store.bots.length,
      strategies: store.strategies.length,
      signals: store.signals.length,
      portfolio: store.portfolio.length,
      activity: store.activity.length,
      settings: store.settings,
    },
    termux_snippets_saved: store.termuxCode.length,
    endpoints: {
      bots:       'GET/POST   /api/luna/bots',
      bot_by_id:  'GET/PATCH/DELETE /api/luna/bots/:id',
      signals:    'GET/POST/DELETE /api/luna/signals',
      strategies: 'GET/POST/PUT/DELETE /api/luna/strategies',
      portfolio:  'GET/POST   /api/luna/portfolio',
      system:     'GET/POST   /api/luna/system',
      chat:       'POST       /api/luna/chat',
      admin:      'GET/POST   /api/admin (requires X-Luna-Key)',
      activity:   'GET/DELETE /api/luna/activity',
    },
    timestamp: new Date().toISOString(),
  }, { headers: cors });
}

// POST /api/admin — run admin commands: save_code, reset_bots, inject_signal, update_setting
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401, headers: cors });

  const body = await req.json().catch(() => null);
  if (!body?.command) return NextResponse.json({ success: false, error: 'command required' }, { status: 400, headers: cors });

  const { command, payload } = body;

  switch (command) {
    case 'save_code': {
      const snippet = payload?.code as string;
      if (!snippet) return NextResponse.json({ success: false, error: 'payload.code required' }, { status: 400, headers: cors });
      store.termuxCode.push(snippet);
      addActivity({ eventType: 'ADMIN', layer: 'V5', message: `Code snippet saved via Termux admin API`, severity: 'info' });
      return NextResponse.json({ success: true, saved: true, total_snippets: store.termuxCode.length }, { headers: cors });
    }
    case 'list_code': {
      return NextResponse.json({ success: true, snippets: store.termuxCode }, { headers: cors });
    }
    case 'reset_bots': {
      store.bots.forEach(b => { b.status = 'stopped'; });
      addActivity({ eventType: 'ADMIN', layer: 'V5', message: `All bots stopped via admin reset`, severity: 'warn' });
      return NextResponse.json({ success: true, message: 'All bots stopped' }, { headers: cors });
    }
    case 'clear_signals': {
      store.signals = [];
      return NextResponse.json({ success: true, message: 'Signals cleared' }, { headers: cors });
    }
    case 'inject_signal': {
      if (!payload) return NextResponse.json({ success: false, error: 'payload required' }, { status: 400, headers: cors });
      const sig = { id: `s${Date.now()}`, coinPair: payload.coinPair ?? 'BTC/USDT', indicator: payload.indicator ?? 'RSI', value: payload.value ?? 28, threshold: payload.threshold ?? 30, triggered: true, severity: payload.severity ?? 'warn', timestamp: new Date() };
      store.signals.unshift(sig as typeof store.signals[0]);
      addActivity({ eventType: 'SIGNAL', layer: 'V2', message: `Admin injected signal: ${sig.indicator} on ${sig.coinPair}`, severity: 'warn' });
      return NextResponse.json({ success: true, signal: sig }, { headers: cors });
    }
    case 'update_setting': {
      if (!payload) return NextResponse.json({ success: false, error: 'payload required' }, { status: 400, headers: cors });
      store.settings = { ...store.settings, ...payload };
      return NextResponse.json({ success: true, settings: store.settings }, { headers: cors });
    }
    default:
      return NextResponse.json({ success: false, error: `Unknown command: ${command}. Valid: save_code, list_code, reset_bots, clear_signals, inject_signal, update_setting` }, { status: 400, headers: cors });
  }
}
