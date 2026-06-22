import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

function routeResponse(msg: string): { layer: string; content: string } {
  const m = msg.toLowerCase();
  if (m.includes('signal') || m.includes('rsi') || m.includes('macd'))
    return { layer: '[V2:COGNITION]', content: `Signal Analysis: BTC/USDT RSI is at 28.4 (oversold). ETH/USDT volume spike at 340% above average. ${store.signals.filter(s => s.triggered).length} active alerts. Recommend: monitor BTC for potential long entry.` };
  if (m.includes('bot') || m.includes('trade') || m.includes('execute'))
    return { layer: '[V5:AGENT]', content: `Bot Status: ${store.bots.filter(b => b.status === 'running').length} running, ${store.bots.filter(b => b.mode === 'live').length} live. Total PnL: $${store.bots.reduce((s, b) => s + b.totalPnl, 0).toLocaleString()}. ALPHA-1 leading with +$1,240.` };
  if (m.includes('revenue') || m.includes('mrr') || m.includes('company') || m.includes('saas'))
    return { layer: '[V7:ECONOMY]', content: `Economy Report: Simulated MRR $21,300 · 4 active companies · 10 services deployed. Revenue velocity +18.4% MoM. Top service: CryptoSignal Pro API at $4,800/mo.` };
  if (m.includes('portfolio') || m.includes('balance') || m.includes('asset'))
    return { layer: '[V3:COGNITION]', content: `Portfolio: $${store.portfolio.reduce((s, a) => s + a.usdValue, 0).toLocaleString()} total. BTC 44.2% · ETH 30.4% · SOL 15%. BTC rebalance needed (+4.2% drift).` };
  if (m.includes('strategy') || m.includes('backtest'))
    return { layer: '[V4:AGENT]', content: `Strategies: ${store.strategies.length} total, ${store.strategies.filter(s => s.status === 'active').length} active. Best: Volume Breakout (74% win rate, 6.2% max DD). Recommend: RSI Reversal v2 for current oversold conditions.` };
  if (m.includes('deploy') || m.includes('api') || m.includes('service'))
    return { layer: '[V9:ECONOMY]', content: `Deployment: 10 services active, 99.8% uptime. 3 API keys issued this week. Gateway latency P95: 142ms. All services nominal.` };
  if (m.includes('ecosystem') || m.includes('expand'))
    return { layer: '[V12:ECOSYSTEM]', content: `Ecosystem: 4 companies, 10 services, 14 nodes in graph. Last expansion: 3 new service nodes spawned. Autonomous mode: ACTIVE. Next expansion trigger: MRR threshold $25,000.` };
  if (m.includes('status') || m.includes('health') || m.includes('system'))
    return { layer: '[V1:COGNITION]', content: `System Health: 94% · All 12 layers online · ${store.bots.filter(b => b.status === 'running').length} bots active · ${store.signals.filter(s => s.triggered).length} signals triggered · Portfolio: $${store.portfolio.reduce((s, a) => s + a.usdValue, 0).toLocaleString()}` };
  return { layer: '[V1:COGNITION]', content: `Acknowledged. Analyzing "${msg.slice(0, 80)}"... Based on current market conditions: BTC RSI oversold at 28.4. System operating at 94% efficiency. 3 DCA bots accumulating. Recommend patience — V2 pattern recognition shows potential reversal within 4-6 hours.` };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.message) return NextResponse.json({ success: false, error: 'message required' }, { status: 400, headers: cors });

  const userMsg = { id: `m${Date.now()}`, role: 'user', content: body.message, layer: 'USER', timestamp: new Date().toISOString() };
  const { layer, content } = routeResponse(body.message);
  const lunaMsg = { id: `m${Date.now() + 1}`, role: 'luna', content, layer, timestamp: new Date().toISOString() };

  addActivity({ eventType: 'CHAT', layer: layer.match(/\[(\w+):/)?.[1] ?? 'V1', message: `Chat: "${body.message.slice(0, 60)}..."`, severity: 'info' });

  return NextResponse.json({ success: true, userMessage: userMsg, lunaResponse: lunaMsg }, { headers: cors });
}
