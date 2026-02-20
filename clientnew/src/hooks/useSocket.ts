import { useSocket } from "@/src/providers/SocketProvider";
import { useCallback, useEffect, useState } from "react";

export function useSocketClient() {
  const { socket, socketId, connected } = useSocket();

  const createRoom = useCallback(
    (onRoomCreated?: (roomId: string, userName: string) => void) => {
      if (!socket) return;
      socket.emit("create_room");
      if (onRoomCreated) {
        socket.once("room_created", (roomId: string, userName: string) => {
          onRoomCreated(roomId, userName);
        });
      }
    },
    [socket]
  );

  const joinRoom = useCallback(
    (roomId: string, user: { id: string; name: string }) => {
      socket?.emit("join_room", { roomId, user });
    },
    [socket]
  );

  function usePlayersInRoom() {
    const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
    useEffect(() => {
      console.log('Setting up players_in_room listener', socket);
      if (!socket) return;
      const handler = (playersList: { id: string; name: string }[]) => {
        setPlayers(playersList);
        console.log('Received players in room:', playersList);
      };
      socket.on('players_in_room', handler);
      return () => {
        socket.off('players_in_room', handler);
      };
    }, [socket]);
    return players;
  }

  return { connected, socketId, createRoom, joinRoom, usePlayersInRoom };
}
