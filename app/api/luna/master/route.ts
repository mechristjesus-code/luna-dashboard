import { NextRequest, NextResponse } from 'next/server';
import { store, masterPauseAll, masterResumeAll, masterStopAll, validateApiKey } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

// GET /api/luna/master — get master status and bot summary
export async function GET(req: NextRequest) {
  const key = req.headers.get('X-Luna-Key') ?? req.nextUrl.searchParams.get('key');
  if (!validateApiKey(key)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const allBots = [...store.bots, ...store.arbitrageBots];
  return NextResponse.json({
    success: true,
    masterStatus: store.masterStatus,
    summary: {
      totalBots: allBots.length,
      running: allBots.filter(b => b.status === 'running').length,
      paused: allBots.filter(b => b.status === 'paused').length,
      stopped: allBots.filter(b => b.status === 'stopped').length,
      liveBots: store.bots.filter(b => b.mode === 'live').length,
      totalPnl: store.bots.reduce((s, b) => s + b.totalPnl, 0) + store.arbitrageBots.reduce((s, b) => s + b.totalPnl, 0),
    },
    recentActivity: store.activity.slice(0, 10),
  }, { headers: cors });
}

// POST /api/luna/master — execute master control action
export async function POST(req: NextRequest) {
  const key = req.headers.get('X-Luna-Key') ?? req.nextUrl.searchParams.get('key');
  if (!validateApiKey(key)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: cors });
  }

  const body = await req.json().catch(() => null);
  if (!body?.action) {
    return NextResponse.json({ success: false, error: 'action required: pause_all | resume_all | stop_all' }, { status: 400, headers: cors });
  }

  switch (body.action) {
    case 'pause_all':
      masterPauseAll();
      break;
    case 'resume_all':
      masterResumeAll();
      break;
    case 'stop_all':
      masterStopAll();
      break;
    default:
      return NextResponse.json({ success: false, error: `Unknown action: ${body.action}` }, { status: 400, headers: cors });
  }

  return NextResponse.json({
    success: true,
    action: body.action,
    masterStatus: store.masterStatus,
    botsAffected: store.bots.length + store.arbitrageBots.length,
  }, { headers: cors });
}
