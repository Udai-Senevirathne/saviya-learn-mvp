'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Socket state store for useSyncExternalStore
let socketState: SocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
};
const socketListeners = new Set<() => void>();

function notifySocketChange() {
  socketListeners.forEach((listener) => listener());
}

function subscribeSocket(callback: () => void) {
  socketListeners.add(callback);
  return () => socketListeners.delete(callback);
}

function getSocketSnapshot() {
  return socketState;
}

function getServerSocketSnapshot(): SocketState {
  return { isConnected: false, isConnecting: false, error: null };
}

function updateSocketState(newState: Partial<SocketState>) {
  socketState = { ...socketState, ...newState };
  notifySocketChange();
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const state = useSyncExternalStore(subscribeSocket, getSocketSnapshot, getServerSocketSnapshot);
  const hasConnectedRef = useRef(false);

  const getSocket = useCallback(() => socketRef.current, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    updateSocketState({ isConnecting: true, error: null });

    const token = localStorage.getItem('token');

    socketRef.current = io(url, {
      auth: { token },
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      updateSocketState({
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    });

    socketRef.current.on('disconnect', () => {
      updateSocketState({ isConnected: false });
    });

    socketRef.current.on('connect_error', (error) => {
      updateSocketState({
        isConnected: false,
        isConnecting: false,
        error: error.message || 'Connection failed',
      });
    });
  }, [url, reconnection, reconnectionAttempts, reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      updateSocketState({
        isConnected: false,
        isConnecting: false,
        error: null,
      });
    }
  }, []);

  const emit = useCallback(
    <T = unknown>(event: string, data?: T) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
        return true;
      }
      return false;
    },
    []
  );

  const on = useCallback(
    <T = unknown>(event: string, callback: (data: T) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
      }
    },
    []
  );

  const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const once = useCallback(
    <T = unknown>(event: string, callback: (data: T) => void) => {
      if (socketRef.current) {
        socketRef.current.once(event, callback);
      }
    },
    []
  );

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && !hasConnectedRef.current) {
      hasConnectedRef.current = true;
      // Use setTimeout to avoid synchronous setState
      setTimeout(() => connect(), 0);
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    getSocket,
    ...state,
    connect,
    disconnect,
    emit,
    on,
    off,
    once,
  };
}

// Hook for joining/leaving rooms
export function useSocketRoom(roomId: string, getSocket: () => Socket | null) {
  const joinedRef = useRef(false);
  
  // Use useSyncExternalStore for the joined state
  const [isJoined, setIsJoined] = useState(() => false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket?.connected || !roomId) {
      if (joinedRef.current) {
        joinedRef.current = false;
        // Defer state update
        setTimeout(() => setIsJoined(false), 0);
      }
      return;
    }

    socket.emit('join_room', roomId);
    joinedRef.current = true;
    // Defer state update
    setTimeout(() => setIsJoined(true), 0);

    return () => {
      socket.emit('leave_room', roomId);
      joinedRef.current = false;
    };
  }, [getSocket, roomId]);

  return { isJoined };
}
