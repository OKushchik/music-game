"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button, Chip } from "@mui/material";
import { AppDispatch, RootState } from "@/src/store/store";
import { clearGamePlayers, setGamePlayers } from "@/src/store/slices/gameSlice";
import { SpotifySong, useGetSpotifyPlaylist } from "@/src/services/apiHooks/useGetSpotifyPlaylist";
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
  const { spotifyPlaylist, loading } = useGetSpotifyPlaylist({ isPrivate: true });
  const { joinRoom } = useSocketClient();
  const { socket, connected, socketId, playerId } = useSocket();
  const [joined, setJoined] = useState(false);
  const [sharedRound, setSharedRound] = useState<{ trackIndex: number | null; insertYear: string | null; activePlayerId: string | null }>({
    trackIndex: null,
    insertYear: null,
    activePlayerId: null,
  });
  const [initialYear, setInitialYear] = useState<string | null>(null);

  const isActivePlayer = sharedRound.activePlayerId === (playerId ?? socketId);

  const sharedSong: SpotifySong | null = useMemo(() => {
    if (!spotifyPlaylist || !spotifyPlaylist.tracks || !spotifyPlaylist.tracks.items.length) return null;
    if (sharedRound.trackIndex == null) return null;
    const idx = sharedRound.trackIndex;
    if (idx < 0 || idx >= spotifyPlaylist.tracks.items.length) return null;
    const track = spotifyPlaylist.tracks.items[idx].track;
    let releaseDate = track.album?.release_date || "";
    if (/^\d{4}$/.test(track.album?.release_date)) {
      releaseDate = `${track.album?.release_date}-01-01`;
    }
    return {
      name: track.name,
      artist: track.artists?.[0]?.name || "Unknown Artist",
      releaseDate,
      spotifyUrl: track.external_urls?.spotify || "",
    };
  }, [spotifyPlaylist, sharedRound.trackIndex]);

  useEffect(() => setIsMounted(true), []);

  // Join the private room if not already joined
  useEffect(() => {
    if (!connected) return;
    if (!socketId) return;
    if (!roomId) return;
    if (!userName.trim()) return;
    if (joined) return;

    const stableId = playerId ?? socketId;
    const alreadyInRoom = players.some(p => p.id === stableId);
    if (alreadyInRoom) {
      setJoined(true);
      return;
    }

    console.log('Attempting to join room with:', { roomId, stableId, userName });
    joinRoom(roomId, { id: stableId, name: userName });
    setJoined(true);
  }, [connected, socketId, roomId, userName, joinRoom, joined, players, playerId]);

  // Listen to game_state from server
  useEffect(() => {
    const handler = (round: { trackIndex: number | null; insertYear: string | null; activePlayerId: string | null }) => {
      setSharedRound(round);
    };
    socket?.on('game_state', handler);
    return () => {
      socket?.off('game_state', handler);
    };
  }, [socket]);

  // Request current game state when joining room
  useEffect(() => {
    if (!roomId) return;
    socket?.emit('request_game_state', { roomId });
  }, [roomId, socket]);

  // Host triggers new round (same song/year for everyone)
  const handleNewRound = () => {
    if (!roomId) return;
    console.log('Host is starting a new round', spotifyPlaylist);
    if (!spotifyPlaylist || !spotifyPlaylist.tracks || !spotifyPlaylist.tracks.items.length) return;
    // Only allow the active player (current turn) to start the next round
    if (!isActivePlayer) return;

    const trackCount = spotifyPlaylist.tracks.items.length;
    const randomIndex = Math.floor(Math.random() * trackCount);
    const track = spotifyPlaylist.tracks.items[randomIndex].track;
    let releaseDate = track.album?.release_date || "";
    if (/^\d{4}$/.test(track.album?.release_date)) {
      releaseDate = `${track.album?.release_date}-01-01`;
    }
    const activePlayerId = sharedRound.activePlayerId ?? players[activePlayerIndex]?.id ?? null;
    socket?.emit('set_round', { roomId, trackIndex: randomIndex, insertYear: releaseDate, activePlayerId });
  };

  // Sync players in room with socket listener
  useEffect(() => {
    if (!connected || !socketId) return;
    const handler = (playersList: { id: string; name: string; years?: string[] }[]) => {
      console.log('Received players_in_room:', playersList);
      dispatch(setGamePlayers(
        playersList.map(p => ({
          id: p.id,
          fullName: p.name,
          years: p.years ?? [],
        }))
      ));
    };
    socket?.on('players_in_room', handler);
    return () => {
      socket?.off('players_in_room', handler);
    };
  }, [connected, socketId, dispatch, socket]);

  // Generate and sync first random year for all players via backend
  useEffect(() => {
    if (!roomId) return;
    if (!connected) return;
    if (!socketId) return;
    if (!socket) return;
    if (initialYear) return; // already initialized

    // Wait until we have the players list from server; if no players yet, don't init
    if (players.length === 0) return;

    // If any player already has a year, skip initialization to avoid duplicates
    if (players.some(p => Array.isArray(p.years) && p.years.length > 0)) return;

    const isCurrentActive = sharedRound.activePlayerId === (playerId ?? socketId);
    if (!isCurrentActive) return;

    const currentYear = new Date().getFullYear();
    const randomYear = Math.floor(Math.random() * (currentYear - 1900 + 1)) + 1900;
    const yearStr = `${randomYear}-01-01`;
    setInitialYear(yearStr);

    // Ask server to initialize this year for all players in the room
    socket.emit('init_year', { roomId, year: yearStr });
  }, [roomId, connected, socketId, socket, sharedRound.activePlayerId, initialYear, players]);

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
              {isActivePlayer && (
                <Button variant="contained" onClick={handleNewRound} disabled={loading}>
                  Random song
                </Button>
              )}
              {sharedSong && <SpotifyPlayer track={sharedSong} />}
              {initialYear && !sharedRound.insertYear && (
                <SortableList
                  players={players}
                  insertYear={initialYear}
                  activePlayerIndex={activePlayerIndex}
                  setActivePlayerIndex={setActivePlayerIndex}
                  roomId={roomId || ""}

                />
              )}
              {!!sharedRound.insertYear && (
                <SortableList
                  players={players}
                  insertYear={sharedRound.insertYear}
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
