import React, { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  socketId: string | null;
  connected: boolean;
  playerId: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  socketId: null,
  connected: false,
  playerId: null,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = 'music_game_player_id';
    let existing = localStorage.getItem(storageKey);
    if (!existing) {
      localStorage.setItem(storageKey, crypto.randomUUID());
    }
    setPlayerId(existing);
    const s = io("http://localhost:8080", { withCredentials: true });
    setSocket(s);

    const onConnect = () => {
      setConnected(true);
      setSocketId(s.id ?? null);
    };
    const onDisconnect = () => {
      setConnected(false);
      setSocketId(null);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.disconnect();
      setSocket(null);
      setSocketId(null);
      setPlayerId(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketId, connected, playerId }}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  return useContext(SocketContext);
}
