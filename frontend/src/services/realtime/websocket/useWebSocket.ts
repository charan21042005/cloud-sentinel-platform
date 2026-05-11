'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';

interface WebSocketOptions {
  url: string;
  onMessage: (data: any) => void;
  reconnectAttempts?: number;
}

/**
 * Architectural Foundation for WebSocket Streams.
 * This hook manages connection lifecycle, automatic reconnection, and message delegation.
 */
export function useWebSocket({ url, onMessage, reconnectAttempts = 5 }: WebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          logger.info(`WebSocket connected: ${url}`);
          setIsConnected(true);
          reconnectCountRef.current = 0; // Reset counter on success
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (e) {
            logger.error('Failed to parse WebSocket message', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          logger.warn(`WebSocket disconnected: ${url}`);
          
          // Exponential backoff reconnection strategy
          if (reconnectCountRef.current < reconnectAttempts) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 10000);
            logger.info(`Attempting reconnect in ${timeout}ms...`);
            reconnectTimeout = setTimeout(connect, timeout);
            reconnectCountRef.current += 1;
          } else {
            logger.error('WebSocket maximum reconnect attempts reached.');
          }
        };

        ws.onerror = (error) => {
          logger.error('WebSocket error encountered', error);
          ws.close(); // Force close to trigger the reconnect flow
        };
      } catch (error) {
        logger.error('Failed to instantiate WebSocket', error);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, reconnectAttempts]); // Note: excluding onMessage to prevent infinite re-renders. Ensure onMessage is stable or wrapped in useCallback.

  const sendMessage = (payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      logger.warn('Cannot send message, WebSocket is not open.');
    }
  };

  return { isConnected, sendMessage };
}
