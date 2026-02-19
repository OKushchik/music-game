'use client';
import { useParams } from 'next/navigation';
import React, {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import {useSocket} from "@/src/providers/SocketProvider";
import {useSocketClient} from "@/src/hooks/useSocket";

const PrivateRoomPage = () => {
  const params = useParams();
  const roomId = params?.privateroomId;
  const { socket } = useSocket();
  const [players, setPlayers] = useState<string[]>([]);
  const {playersInRoom} = useSocketClient();

  useEffect(() => {
    if (!socket) return;
    playersInRoom();
  }, []);

  return (
    <div style={{padding: 32}}>
      <Typography variant="h4" gutterBottom>
        Room ID: {roomId}
      </Typography>
      <ul>
        {players.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
    </div>
  );
};

export default PrivateRoomPage;



