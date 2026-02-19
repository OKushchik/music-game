'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Typography from '@mui/material/Typography';
import { useSocketClient } from '@/src/hooks/useSocket';

const RoomPage = () => {
  const params = useParams();
  const roomId = params?.roomId;
  const { connected } = useSocketClient();
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    const { socket } = require('@/src/providers/SocketProvider').useSocket();
    if (!socket) return;
    const handler = (playersList: string[]) => setPlayers(playersList);
    socket.on('players_in_room', handler);
    return () => {
      socket.off('players_in_room', handler);
    };
  }, [roomId, connected]);

  return (
    <div style={{ padding: 32 }}>
      <Typography variant="h4" gutterBottom>
        Room ID: {roomId}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Players in room:
      </Typography>
      <ul>
        {players.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
    </div>
  );
};

export default RoomPage;
