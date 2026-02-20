"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button, Chip } from "@mui/material";
import { AppDispatch, RootState } from "@/src/store/store";
import { clearGamePlayers, initYearForPlayer, setGamePlayers } from "@/src/store/slices/gameSlice";
import { useGetSpotifyPlaylist } from "@/src/services/apiHooks/useGetSpotifyPlaylist";
import { SpotifyPlayer } from "@/src/app/components/SpotifyPlayer/SpotifyPlayer";
import SortableList from "@/src/app/components/SortableList/SortableList";
import { toMs } from "@/src/utils/helpers";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import SocketClient from "@/src/app/components/SocketClient/SocketClient";
import { useSocket } from "@/src/providers/SocketProvider";
import { useSocketClient } from "@/src/hooks/useSocket";

function PrivateRoomPage() {
  const players = useSelector((state: RootState) => state.game.players);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.privateroomId as string | undefined;
  const userName = searchParams.get("name") || "";
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [viewYearsPlayerIndex, setViewYearsPlayerIndex] = useState<number>(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { spotifyPlaylist, randomSong, loading, generateRandomSong } = useGetSpotifyPlaylist();
  const { joinRoom } = useSocketClient();
  const { socket, connected, socketId } = useSocket();
  const [joined, setJoined] = useState(false);

  useEffect(() => setIsMounted(true), []);

  // Join the private room if not already joined
  useEffect(() => {
    if (!connected) return;
    if (!socketId) return;
    if (!roomId) return;
    if (!userName.trim()) return;
    if (joined) return;
    joinRoom(roomId, { id: socketId, name: userName });
    setJoined(true);
  }, [connected, socketId, roomId, userName, joinRoom, joined]);

  // Initialize years for players
  useEffect(() => {
    players.forEach((player) => {
      if (player.years && player.years.length === 0) {
        const randomYear = Math.floor(Math.random() * (2026 - 1900 + 1)) + 1900;
        dispatch(initYearForPlayer({ playerId: player.id, year: `${randomYear}-01-01` }));
      }
    });
  }, [players, dispatch]);

  useEffect(() => {
    generateRandomSong();
  }, [spotifyPlaylist, activePlayerIndex]);

  // Sync players in room with socket listener
  useEffect(() => {
    if (!connected || !socketId) return;
    const handler = (playersList: { id: string; name: string }[]) => {
      dispatch(setGamePlayers(
        playersList.map(p => ({
          id: p.id,
          fullName: p.name,
          years: [],
        }))
      ));
    };
    socket?.on('players_in_room', handler);
    return () => {
      socket?.off('players_in_room', handler);
    };
  }, [connected, socketId, dispatch, socket]);

  return (
    isMounted && (
      <div>
        <Box component="section" sx={{ p: 2, maxWidth: 900, margin: "0 auto" }}>
          <Button
            sx={{ display: "block", marginLeft: "auto" }}
            variant="contained"
            color="error"
            onClick={() => {
              router.push("/");
              dispatch(clearGamePlayers());
            }}
            disabled={players.length === 0}
          >
            Close the Game
          </Button>
          <Typography variant="h2" sx={{ fontSize: 24, marginBottom: 2, textAlign: "center" }}>
            Private Room Page
          </Typography>

          <div style={{ justifyContent: "space-between" }}>
            <Box
              sx={{
                mt: 4,
                minWidth: 500,
                padding: "30px 20px",
                border: "1px dashed gray",
                borderRadius: "10px",
                display: "flex",
                gap: "20px",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 18, marginBottom: 2, textAlign: "center" }}>
                {`Name: ${players[activePlayerIndex]?.fullName}`}
              </Typography>
              <Button variant="contained" onClick={generateRandomSong} disabled={loading}>
                Random song
              </Button>
              <SpotifyPlayer track={randomSong!} />
              {!!randomSong?.releaseDate && (
                <SortableList
                  players={players}
                  insertYear={randomSong.releaseDate}
                  activePlayerIndex={activePlayerIndex}
                  setActivePlayerIndex={setActivePlayerIndex}
                  roomId={roomId || ""}
                />
              )}
            </Box>
          </div>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontSize: 18, marginBottom: 2, textAlign: "center" }}>
              Players in Room ({players.length}) (
              {players.map((player, index) => (
                <Button key={player.id} onClick={() => setViewYearsPlayerIndex(index)}>
                  {`${player.fullName}`}
                </Button>
              ))}
              )
            </Typography>
            <Typography variant="h2" sx={{ fontSize: 18, marginBottom: 2, textAlign: "center" }}>
              {`Name: ${players[viewYearsPlayerIndex]?.fullName}`}
            </Typography>

            <Box>
              {[...(players[viewYearsPlayerIndex]?.years ?? [])]
                .sort((a, b) => toMs(a) - toMs(b))
                .map((year, idx) => (
                  <Chip key={`${year}-${idx}`} label={year} sx={{ mr: 1, mb: 1 }} />
                ))}
            </Box>
          </Box>

          {players.length === 0 && (
            <Typography sx={{ textAlign: "center", mt: 4, color: "gray" }}>
              No players selected. Start a new game from the Game page.
            </Typography>
          )}
        </Box>

        <SocketClient />
      </div>
    )
  );
}

export default PrivateRoomPage;
