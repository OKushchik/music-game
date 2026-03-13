import { useSocket } from "@/src/providers/SocketProvider";
import { useEffect, useState } from "react";

export function useSocketClient() {
  const { socket, socketId, connected, playerId } = useSocket();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);

  const createRoom = () => {
    if (!socket) return;
    socket.emit("create_room");
  };

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = ({ roomId: newRoomId }: { roomId: string }) => {
      setRoomId(newRoomId);
    };
    const handleRoomInfo = ({ roomId: infoRoomId, trackId: infoTrackId }: { roomId: string; trackId: string }) => {
      setRoomId(infoRoomId);
      setTrackId(infoTrackId);
    };
    socket.on("room_created", handleRoomCreated);
    socket.on("room_info", handleRoomInfo);
    return () => {
      socket.off("room_created", handleRoomCreated);
      socket.off("room_info", handleRoomInfo);
    };
  }, [socket]);

  const joinRoom = (roomId: string, user: { id: string; name: string }) => {
    if (!socket) return;
    const payload: { roomId: string; user: { id: string; name: string }} = { roomId, user };
    socket.emit("join_room", payload);
  };

  const addPlayListId =(roomId: string,trackId: string)=>{
    if (!socket || !roomId || !trackId) return;
    socket.emit("add_track-list", roomId, trackId);
  }

  function usePlayersInRoom() {
    const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
    useEffect(() => {
      if (!socket) return;
      const handler = (playersList: { id: string; name: string }[]) => {
        setPlayers(playersList);
      };
      socket.on('players_in_room', handler);
      return () => {
        socket.off('players_in_room', handler);
      };
    }, [socket]);
    return players;
  }

  return { connected, socketId, playerId, roomId, trackId, createRoom, joinRoom, addPlayListId, usePlayersInRoom, socket };
}
