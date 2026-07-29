import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      // In development, Vite proxies this to http://localhost:5000
      // In production, it connects to the same host
      socket = io();
      
      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    return () => {
      // Shared connection, do not disconnect on unmount
    };
  }, []);

  return { socket, isConnected };
};
