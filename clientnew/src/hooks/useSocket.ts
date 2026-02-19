import { useSocket } from "@/src/providers/SocketProvider";
import { useCallback } from "react";

export function useSocketClient() {
  const { socket, connected } = useSocket();

  // createRoom now accepts a callback to receive the roomId
  const createRoom = useCallback(
    (onRoomCreated?: (roomId: string) => void) => {
      if (!socket) return;
      socket.emit("create_room");
      if (onRoomCreated) {
        socket.once("room_created", (roomId: string) => {
          onRoomCreated(roomId);
        });
      }
    },
    []
  );

  const joinRoom = useCallback(
    (gameId: string) => {
      socket?.emit("join_room", `${gameId}`);
    }, []
  );

  const playersInRoom = useCallback(
    () => {
      socket?.on('players_in_room', (playersList: string[]) => {
        console.log('Received players in room:', playersList);
      });
    },
    []
  );



  return { connected, createRoom, joinRoom, playersInRoom };
}
