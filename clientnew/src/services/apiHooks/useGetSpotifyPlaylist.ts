import { useEffect, useState } from "react";
import { getSpotifyPlaylist } from "@/src/services/api/spotify";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { useSocketClient } from "@/src/hooks/useSocket";

export type SpotifySong = {
  name: string;
  artist: string;
  releaseDate: string;
  spotifyUrl: string;
};

export type UseGetSpotifyPlaylistResult = {
  spotifyPlaylist: any;
  randomSong: SpotifySong | null;
  loading: boolean;
  error: Error | null;
  generateRandomSong: () => void;
};

export function useGetSpotifyPlaylist({ isPrivate = false }: { isPrivate?: boolean } = {}): UseGetSpotifyPlaylistResult {
  const { trackId: socketTrackId } = useSocketClient();
  console.log("useGetSpotifyPlaylist - socketTrackId:", socketTrackId);
  const reduxTrackId = useSelector((state: RootState) => state.game.trackId);
  const trackId = isPrivate ? socketTrackId : reduxTrackId;
  console.log("useGetSpotifyPlaylist - trackId:", trackId);

  const [spotifyPlaylist, setSpotifyPlaylist] = useState<any | null>(null);
  const [randomSong, setRandomSong] = useState<SpotifySong | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateRandomSong = () => {
    if (!spotifyPlaylist?.tracks?.items?.length) return;
    const randomIndex = Math.floor(Math.random() * spotifyPlaylist.tracks.items.length);
    const trackItem = spotifyPlaylist.tracks.items[randomIndex];
    if (!trackItem?.track) return;
    const track = trackItem.track;
    let releaseDate = track.album?.release_date ?? "";

    if (/^\d{4}$/.test(track.album?.release_date ?? "")) {
      releaseDate = `${track.album?.release_date}-01-01`;
    }

    const song: SpotifySong = {
      name: track.name ?? "Unknown Track",
      artist: track.artists?.[0]?.name ?? "Unknown Artist",
      releaseDate,
      spotifyUrl: track.external_urls?.spotify ?? "",
    };

    setRandomSong(song);
  };

  useEffect(() => {
    if (!trackId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await getSpotifyPlaylist(trackId);
        if (cancelled) return;
        setSpotifyPlaylist(res);
        if (res?.tracks?.items?.length) {
          const randomIndex = Math.floor(Math.random() * res.tracks.items.length);
          const trackItem = res.tracks.items[randomIndex];
          if (trackItem?.track) {
            let releaseDate = trackItem.track.album?.release_date ?? "";
            if (/^\d{4}$/.test(trackItem.track.album?.release_date ?? "")) {
              releaseDate = `${trackItem.track.album?.release_date}-01-01`;
            }
            setRandomSong({
              name: trackItem.track.name ?? "Unknown Track",
              artist: trackItem.track.artists?.[0]?.name ?? "Unknown Artist",
              releaseDate,
              spotifyUrl: trackItem.track.external_urls?.spotify ?? "",
            });
          } else {
            setRandomSong(null);
          }
        } else {
          setRandomSong(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setSpotifyPlaylist(null);
          setRandomSong(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trackId]);

  return { spotifyPlaylist, randomSong, loading, error, generateRandomSong };
}
