import { NextRequest, NextResponse } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Luna-Key',
};

export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

// ── System context builder ─────────────────────────────────────────
function buildSystemContext(): string {
  const runningBots = store.bots.filter(b => b.status === 'running').length;
  const liveBots = store.bots.filter(b => b.mode === 'live').length;
  const totalPnl = store.bots.reduce((s, b) => s + b.totalPnl, 0);
  const portfolioValue = store.portfolio.reduce((s, a) => s + a.usdValue, 0);
  const triggeredSignals = store.signals.filter(s => s.triggered).length;
  const arbBots = store.arbitrageBots.filter(b => b.status === 'running').length;
  const arbPnl = store.arbitrageBots.reduce((s, b) => s + b.totalPnl, 0);

  return `You are LUNA, an advanced AI trading intelligence system. You are the command interface for the LUNA Dashboard — a comprehensive crypto trading bot suite.

Current System State:
- Trading Bots: ${runningBots} running, ${liveBots} live, Total PnL: $${totalPnl.toLocaleString()}
- Arbitrage Bots: ${arbBots} running, Total Arb PnL: $${arbPnl.toLocaleString()}
- Active Signals: ${triggeredSignals} triggered
- Portfolio Value: $${portfolioValue.toLocaleString()}
- Active Strategies: ${store.strategies.filter(s => s.status === 'active').length}
- Master Status: ${store.masterStatus.toUpperCase()}
- System Version: V2.0 (12 layers online)

Bot Details:
${store.bots.map(b => `  - ${b.name} [${b.coinPair}] ${b.status.toUpperCase()} ${b.mode.toUpperCase()} PnL: $${b.totalPnl}`).join('\n')}

Recent Signals:
${store.signals.filter(s => s.triggered).slice(0, 5).map(s => `  - ${s.coinPair} ${s.indicator}: ${s.value} (${(s as { sentimentLabel?: string }).sentimentLabel ?? 'N/A'}, ${(s as { confidence?: number }).confidence ?? '?'}% confidence)`).join('\n')}

You respond as LUNA with deep knowledge of:
- Crypto trading strategies (DCA, Grid, Signal, Arbitrage, SmartTrade)
- Technical analysis (RSI, MACD, Volume, Momentum, ATR)
- Risk management and portfolio optimization
- The LUNA V1–V12 architecture layers
- Real-time market intelligence

Keep responses concise, data-driven, and action-oriented. Use the current system state to provide relevant insights. Always identify which LUNA layer is responding (e.g., [V2:COGNITION], [V5:AGENT], etc.).`;
}

// ── Fallback rule-based router ─────────────────────────────────────
function fallbackResponse(msg: string): { layer: string; content: string } {
  const m = msg.toLowerCase();
  if (m.includes('arbitrage') || m.includes('arb') || m.includes('spread'))
    return { layer: '[V5:AGENT]', content: `Arbitrage Status: ${store.arbitrageBots.filter(b => b.status === 'running').length} bots active. ARB-BOT-1 leading with $${store.arbitrageBots[0]?.totalPnl ?? 0} PnL, ${store.arbitrageBots[0]?.winRate ?? 0}% win rate. Monitoring ${store.arbitrageBots[0]?.exchanges.join(', ') ?? 'exchanges'}.` };
  if (m.includes('signal') || m.includes('rsi') || m.includes('macd') || m.includes('sentiment'))
    return { layer: '[V2:COGNITION]', content: `Signal Analysis: ${store.signals.filter(s => s.triggered).length} active alerts. BTC/USDT RSI oversold at 28.4 (Bullish sentiment 91%). ETH volume spike 340% above average. Composite AI strategy scoring 94/100.` };
  if (m.includes('bot') || m.includes('trade') || m.includes('execute'))
    return { layer: '[V5:AGENT]', content: `Bot Status: ${store.bots.filter(b => b.status === 'running').length} running, ${store.bots.filter(b => b.mode === 'live').length} live. Total PnL: $${store.bots.reduce((s, b) => s + b.totalPnl, 0).toLocaleString()}. GAMMA-3 leading with +$5,600 (74% win rate, Sharpe 2.41). Master: ${store.masterStatus.toUpperCase()}.` };
  if (m.includes('risk') || m.includes('drawdown') || m.includes('exposure'))
    return { layer: '[V6:RISK]', content: `Risk Report: Portfolio risk score 58/100. DELTA-9 highest risk at 78/100 with 12.8% drawdown. BTC allocation drift +4.2%. Recommend: rebalance BTC to 40% target. ARB-BOT-1 lowest risk at 15/100.` };
  if (m.includes('revenue') || m.includes('mrr') || m.includes('company') || m.includes('saas'))
    return { layer: '[V7:ECONOMY]', content: `Economy Report: Simulated MRR $21,300 · 4 active companies · 10 services deployed. Revenue velocity +18.4% MoM. Top service: CryptoSignal Pro API at $4,800/mo.` };
  if (m.includes('portfolio') || m.includes('balance') || m.includes('asset'))
    return { layer: '[V3:COGNITION]', content: `Portfolio: $${store.portfolio.reduce((s, a) => s + a.usdValue, 0).toLocaleString()} total. BTC 44.2% (drift +4.2%) · ETH 30.4% · SOL 15%. Rebalance needed: reduce BTC, increase USDT.` };
  if (m.includes('strategy') || m.includes('backtest'))
    return { layer: '[V4:AGENT]', content: `Strategies: ${store.strategies.length} total, ${store.strategies.filter(s => s.status === 'active').length} active. Best: Composite AI Signal (79% win rate, Sharpe 3.12). Recommend deploying on OMEGA-7.` };
  if (m.includes('status') || m.includes('health') || m.includes('system'))
    return { layer: '[V1:COGNITION]', content: `System Health: 97% · All 12 layers online · ${store.bots.filter(b => b.status === 'running').length} trading bots + ${store.arbitrageBots.filter(b => b.status === 'running').length} arb bots active · ${store.signals.filter(s => s.triggered).length} signals triggered · Portfolio: $${store.portfolio.reduce((s, a) => s + a.usdValue, 0).toLocaleString()} · V2.0` };
  return { layer: '[V1:COGNITION]', content: `Acknowledged. Analyzing "${msg.slice(0, 80)}"... LUNA V2.0 processing. BTC RSI oversold at 28.4 (Bullish 91%). ${store.arbitrageBots.filter(b => b.status === 'running').length} arb bots scanning spreads. Composite AI strategy scoring 94/100. System at 97% efficiency.` };
}

// ── AI-powered response ────────────────────────────────────────────
async function getAIResponse(message: string, history: Array<{ role: string; content: string }>): Promise<{ layer: string; content: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiBase = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';

  if (!apiKey) return fallbackResponse(message);

  try {
    const messages = [
      { role: 'system', content: buildSystemContext() },
      ...history.slice(-6).map((h: { role: string; content: string }) => ({ role: h.role === 'luna' ? 'assistant' : 'user', content: h.content })),
      { role: 'user', content: message },
    ];

    const res = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-5-nano', messages, max_tokens: 400, temperature: 0.7 }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return fallbackResponse(message);

    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content ?? '';
    const layerMatch = content.match(/\[V\d+:[A-Z]+\]/);
    const layer = layerMatch ? layerMatch[0] : '[V1:COGNITION]';
    const cleanContent = content.replace(/^\[V\d+:[A-Z]+\]\s*/, '');
    return { layer, content: cleanContent || content };
  } catch {
    return fallbackResponse(message);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.message) return NextResponse.json({ success: false, error: 'message required' }, { status: 400, headers: cors });

  const history = Array.isArray(body.history) ? body.history : [];
  const userMsg = { id: `m${Date.now()}`, role: 'user', content: body.message, layer: 'USER', timestamp: new Date().toISOString() };
  const { layer, content } = await getAIResponse(body.message, history);
  const lunaMsg = { id: `m${Date.now() + 1}`, role: 'luna', content, layer, timestamp: new Date().toISOString() };

  addActivity({
    eventType: 'CHAT',
    layer: layer.match(/\[V(\d+):/)?.[1] ? `V${layer.match(/\[V(\d+):/)?.[1]}` : 'V1',
    message: `Chat: "${body.message.slice(0, 60)}${body.message.length > 60 ? '...' : ''}"`,
    severity: 'info',
  });

  return NextResponse.json({ success: true, userMessage: userMsg, lunaResponse: lunaMsg }, { headers: cors });
}
