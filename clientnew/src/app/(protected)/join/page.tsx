'use client'

import { useRouter } from 'next/navigation';
import {useEffect, useState} from "react";
import {useSocketClient} from "@/src/hooks/useSocket";
import {display} from "@mui/system";


export default function Join() {
  const router = useRouter();
  const [gameId, setGameId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
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
    router.push(`/private-game/${gameId}?name=${encodeURIComponent(playerName)}`);
  }


  return (
    <div>
      <p>Enter the game code:</p>
      <input type="text" onChange={(e) => setGameId(e.currentTarget.value)}/>
      <p>Enter the name:</p>
      <input type="text" onChange={(e) => setPlayerName(e.currentTarget.value)}/>
      <p></p>
      <button  onClick={joinGame} disabled={!connected || gameId.trim() === ''}>
        Join game
      </button>
    </div>
  )
}
