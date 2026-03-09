'use client'

import { useRouter } from 'next/navigation';
import React, {useEffect, useState} from "react";
import {useSocketClient} from "@/src/hooks/useSocket";
import {display} from "@mui/system";
import Typography from "@mui/material/Typography";
import {Button, Input} from "@mui/material";
import Box from "@mui/material/Box";


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
      <Box
        component="section"
        sx={{
          p: 2,
          border: '1px dashed grey',
          maxWidth: 400,
          margin: '50px auto'
        }}
      >
        <Typography
          component="p"
          sx={{fontSize: 24, marginBottom: 2, textAlign: 'center'}}
        >
          Enter the game code:
        </Typography>

        <Input
          sx={{width: "100%", marginBottom: 2}}
          type="text"
          onChange={(e) => setGameId(e.currentTarget.value)}
        />

        <Typography
          variant="h3"
          sx={{fontSize: 24, marginBottom: 2, textAlign: 'center'}}
        >
          Enter the name:
        </Typography>

        <Input
          sx={{width: "100%", marginBottom: 2}}
          type="text"
          onChange={(e) => setPlayerName(e.currentTarget.value)}
        />

        <Button
          variant="contained"
          onClick={joinGame}
          disabled={!connected || gameId.trim() === ''}
          sx={{mt: 2}}
        >
          Join game
        </Button>
      </Box>
    </div>



    // <div>
    //   <p>Enter the game code:</p>
    //   <input type="text" onChange={(e) => setGameId(e.currentTarget.value)}/>
    //     <p>Enter the name:</p>
    //     <input type="text" onChange={(e) => setPlayerName(e.currentTarget.value)}/>
    //     <p></p>
    //     <button  onClick={joinGame} disabled={!connected || gameId.trim() === ''}>
    //       Join game
    //     </button>
    //   </div>
  )
}
