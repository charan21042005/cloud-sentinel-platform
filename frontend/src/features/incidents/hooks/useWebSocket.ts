import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WebSocketMessage {
  event: string;
  mutation?: string;
  channel?: string;
  actor?: string;
  action?: string;
  data?: any;
  message?: string;
}

export function useWebSocket(channel: 'incidents' | 'telemetry' | 'system-events') {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const wsUrl = `ws://localhost:8000/ws/${channel}${token ? `?token=${token}` : ''}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttempts.current = 0;
        
        // Initialize presence tracking heartbeat loop
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        if (event.data === 'pong') return;

        try {
          const payload: WebSocketMessage = JSON.parse(event.data);

          if (payload.event === 'connection_established') {
            // Channel successfully confirmed
            return;
          }

          if (channel === 'incidents') {
            // Live operational updates arrive: automatically refresh Query Engine caches
            queryClient.invalidateQueries({ queryKey: ['incidents'] });

            if (payload.event === 'incident_created') {
              toast.error('🔥 Core Threat Alert Triggered', {
                description: payload.data?.title || 'An infrastructure anomaly was broadcast across the real-time fabric.',
              });
            } else if (payload.mutation === 'correlation') {
              // Suppress noisy toast alerts for continuous correlation loops, let UI counters handle visuals
            }
          } else if (channel === 'system-events' && payload.event === 'operator_action') {
            // Collaborative operations tracking notification broadcast
            toast.info(`🛡️ Operator Override: ${payload.actor || 'System'}`, {
              description: payload.action,
            });
          }
        } catch (err) {
          // Plaintext message or unparseable frame
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        clearInterval(pingIntervalRef.current);

        // Exponential backoff reconnect logic
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setIsReconnecting(true);
          const timeout = Math.min(1000 * 2 ** reconnectAttempts.current, 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, timeout);
        } else {
          setIsReconnecting(false);
          toast.warning('🔌 Real-Time SOC Fabric Disconnected', {
            description: `Channel '${channel}' stream dropped. Max reconnect attempts reached.`,
          });
        }
      };

      ws.onerror = () => {
        // Handled cleanly by onclose trigger lifecycles
      };
    } catch (err) {
      setIsConnected(false);
    }
  }, [channel, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(pingIntervalRef.current);
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  return { isConnected, isReconnecting };
}
