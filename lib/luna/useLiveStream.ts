"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export interface StreamEvent {
  type: "snapshot" | "bot_update" | "arbitrage" | "heartbeat" | "activity" | "signal";
  [key: string]: unknown;
}

export interface LiveStreamState {
  connected: boolean;
  lastEvent: StreamEvent | null;
  botUpdates: Record<string, { totalPnl: number; delta: number; timestamp: string }>;
  arbEvents: Array<{ botId: string; name: string; spreadPct: number; profit: number; timestamp: string }>;
  masterStatus: string;
  activeBots: number;
  totalPnl: number;
  reconnectCount: number;
}

const initialState: LiveStreamState = {
  connected: false,
  lastEvent: null,
  botUpdates: {},
  arbEvents: [],
  masterStatus: "running",
  activeBots: 0,
  totalPnl: 0,
  reconnectCount: 0,
};

/**
 * useLiveStream — connects to /api/luna/stream (SSE) and provides real-time state.
 * Automatically reconnects on disconnect with exponential backoff.
 */
export function useLiveStream(enabled = true) {
  const [state, setState] = useState<LiveStreamState>(initialState);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(2000);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    const es = new EventSource("/api/luna/stream");
    esRef.current = es;

    es.onopen = () => {
      setState(prev => ({ ...prev, connected: true }));
      reconnectDelay.current = 2000; // reset backoff
    };

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as StreamEvent;
        setState(prev => {
          const next = { ...prev, lastEvent: event };

          if (event.type === "heartbeat") {
            next.masterStatus = (event.masterStatus as string) ?? prev.masterStatus;
            next.activeBots = (event.activeBots as number) ?? prev.activeBots;
            next.totalPnl = (event.totalPnl as number) ?? prev.totalPnl;
          }

          if (event.type === "bot_update") {
            next.botUpdates = {
              ...prev.botUpdates,
              [event.botId as string]: {
                totalPnl: event.totalPnl as number,
                delta: event.delta as number,
                timestamp: event.timestamp as string,
              },
            };
          }

          if (event.type === "arbitrage") {
            next.arbEvents = [
              {
                botId: event.botId as string,
                name: event.name as string,
                spreadPct: event.spreadPct as number,
                profit: event.profit as number,
                timestamp: event.timestamp as string,
              },
              ...prev.arbEvents,
            ].slice(0, 20);
          }

          return next;
        });
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setState(prev => ({ ...prev, connected: false, reconnectCount: prev.reconnectCount + 1 }));

      // Exponential backoff: 2s, 4s, 8s, max 30s
      const delay = Math.min(reconnectDelay.current, 30000);
      reconnectDelay.current = delay * 2;
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [enabled]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    setState(prev => ({ ...prev, connected: false }));
  }, []);

  return { ...state, disconnect };
}
