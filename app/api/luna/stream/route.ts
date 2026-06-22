import { NextRequest } from 'next/server';
import { store, addActivity } from '@/lib/luna/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/luna/stream
 * Server-Sent Events endpoint for real-time activity and signal streaming.
 * Clients connect once and receive live updates without polling.
 *
 * Event types:
 *   - activity: new activity log entry
 *   - signal: new triggered signal
 *   - bot_update: bot status/PnL change
 *   - heartbeat: keep-alive ping every 5s
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial snapshot
      const snapshot = {
        type: 'snapshot',
        activity: store.activity.slice(0, 20),
        signals: store.signals.filter(s => s.triggered).slice(0, 10),
        bots: store.bots.map(b => ({ id: b.id, name: b.name, status: b.status, totalPnl: b.totalPnl })),
        masterStatus: store.masterStatus,
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`));

      // Heartbeat + simulated live updates every 4 seconds
      const interval = setInterval(() => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        try {
          // Simulate random bot PnL tick
          const runningBots = store.bots.filter(b => b.status === 'running');
          if (runningBots.length > 0) {
            const bot = runningBots[Math.floor(Math.random() * runningBots.length)];
            const delta = parseFloat(((Math.random() - 0.45) * 12).toFixed(2));
            bot.totalPnl = parseFloat((bot.totalPnl + delta).toFixed(2));
            bot.pnlHistory.push({ time: `${bot.pnlHistory.length}h`, pnl: bot.totalPnl });
            if (bot.pnlHistory.length > 48) bot.pnlHistory = bot.pnlHistory.slice(-48);

            const botUpdate = {
              type: 'bot_update',
              botId: bot.id,
              name: bot.name,
              totalPnl: bot.totalPnl,
              delta,
              timestamp: new Date().toISOString(),
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(botUpdate)}\n\n`));
          }

          // Simulate arbitrage opportunity detection
          const runningArbBots = store.arbitrageBots.filter(b => b.status === 'running');
          if (runningArbBots.length > 0 && Math.random() > 0.6) {
            const arbBot = runningArbBots[0];
            const spreadPct = parseFloat((Math.random() * 0.4 + 0.08).toFixed(3));
            const profit = parseFloat((spreadPct * 5 - 0.2).toFixed(2));

            if (profit > 0) {
              arbBot.totalPnl = parseFloat((arbBot.totalPnl + profit).toFixed(2));
              arbBot.tradeCount++;
              arbBot.opportunitiesDetected++;
              arbBot.opportunitiesExecuted++;

              const arbEvent = {
                type: 'arbitrage',
                botId: arbBot.id,
                name: arbBot.name,
                spreadPct,
                profit,
                totalPnl: arbBot.totalPnl,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(arbEvent)}\n\n`));

              addActivity({
                eventType: 'ARB_TRADE',
                layer: 'V5',
                message: `${arbBot.name} captured spread +${spreadPct}% · Profit: $${profit}`,
                severity: 'live',
              });
            }
          }

          // Heartbeat
          const heartbeat = {
            type: 'heartbeat',
            masterStatus: store.masterStatus,
            activeBots: store.bots.filter(b => b.status === 'running').length,
            totalPnl: store.bots.reduce((s, b) => s + b.totalPnl, 0),
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 4000);

      // Clean up when client disconnects
      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',
    },
  });
}
