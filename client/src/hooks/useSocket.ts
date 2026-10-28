import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@samudra/shared';

export type SamudraSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api$/, '') ||
  'http://localhost:5000';

/**
 * Live connection: joins `global` + region rooms, exposes socket + status.
 * Consumers invalidate react-query caches via the onEvent callback.
 */
export function useSocket(onEvent?: (event: string, payload: unknown) => void) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<SamudraSocket | null>(null);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || undefined;
    const socket: SamudraSocket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('region:join', 'global');
      const region = localStorage.getItem('userRegion');
      if (region && region !== 'Unknown') socket.emit('region:join', region);
    });

    socket.on('disconnect', () => setConnected(false));

    if (handlerRef.current) {
      const handler = handlerRef.current;
      socket.onAny((event: string, payload: unknown) => handler(event, payload));    }

    return () => {
      socket.offAny();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socketRef, connected };
}
