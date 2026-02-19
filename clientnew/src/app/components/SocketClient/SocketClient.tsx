'use client';

import {useSocketClient} from "@/src/hooks/useSocket";

export default function SocketClient() {
  const {connected, sendTest, joinRoom} = useSocketClient();

  return (
    <div>
      <div>Socket status: {connected ? "connected" : "disconnected"}</div>
      <button onClick={sendTest}>Send test message</button>
      <button onClick={() => joinRoom(crypto.randomUUID())}>Join room</button>
      {/*<ul>*/}
      {/*  {messages.map((m, i) => (*/}
      {/*    <li key={i}>{m}</li>*/}
      {/*  ))}*/}
      {/*</ul>*/}
    </div>
  );
}
