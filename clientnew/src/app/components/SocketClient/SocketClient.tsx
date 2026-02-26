'use client';

import {useSocketClient} from "@/src/hooks/useSocket";

export default function SocketClient() {
  const {connected, socketId, roomId} = useSocketClient();

  return (
    <div>
      <div>Socket status: {connected ? "connected" : "disconnected"}</div>
      <div>Socket ID: {socketId}</div>
      <div>Room ID: {roomId}</div>
    </div>
  );
}
