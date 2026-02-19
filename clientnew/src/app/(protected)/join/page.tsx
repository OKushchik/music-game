'use client'

import { useRouter } from 'next/navigation';
import {useEffect, useState} from "react";
import {useSocketClient} from "@/src/hooks/useSocket";


export default function Join() {
  const router = useRouter();
  const [gameId, setGameId] = useState<string>('');
  const { connected, joinRoom } = useSocketClient();

  // useEffect(() => {
  //   socket.emit("join_room", gameId);
  //
  //   socket.on("player_joined", id => {
  //     console.log("player joined", id);
  //   });
  //
  //   return () => {
  //     socket.off("player_joined");
  //   };
  // }, [gameId]);

  const joinGame = () => {
    joinRoom(gameId);
    router.push(`/private-game/${gameId}`);
  }


  return (
    <div>
      Enter the game code:
      <input type="text" onChange={(e) => setGameId(e.currentTarget.value)}/>
      <button onClick={joinGame} disabled={!connected || gameId.trim() === ''}>
        Join game
      </button>
    </div>
  )
}
