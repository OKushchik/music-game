import { useEffect, useState } from "react";
import {getSpotifyPlaylist} from "@/src/services/api/spotify";

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

export function useGetSpotifyPlaylist(playlist: string): UseGetSpotifyPlaylistResult {
  const [spotifyPlaylist, setSpotifyPlaylist] = useState<any | null>([]);
  const [randomSong, setRandomSong] = useState<SpotifySong | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const generateRandomSong = () => {
    if (spotifyPlaylist && spotifyPlaylist.tracks && spotifyPlaylist.tracks.items.length > 0) {
      const randomIndex = Math.floor(Math.random() * spotifyPlaylist.tracks.items.length);
      const track = spotifyPlaylist.tracks.items[randomIndex].track;
      let releaseDate = track.album?.release_date || "";

      if (/^\d{4}$/.test(track.album?.release_date)) {
        console.log("Release date is year only:", track.album?.release_date);
        releaseDate = `${track.album?.release_date}-01-01`;
      }

      const song: SpotifySong = {
        name: track.name,
        artist: track.artists?.[0]?.name || "Unknown Artist",
        releaseDate: releaseDate,
        spotifyUrl: track.external_urls?.spotify || "",
      };

      setRandomSong(song);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getSpotifyPlaylist(playlist);
        setSpotifyPlaylist(res);
        if (res && res.tracks && res.tracks.items.length > 0) {
          generateRandomSong();
        } else {
          setRandomSong(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        setSpotifyPlaylist(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { spotifyPlaylist, randomSong, loading, error, generateRandomSong };
}
