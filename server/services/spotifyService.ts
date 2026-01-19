import axios from "axios";
import qs from "qs";
import "dotenv/config";

let basicToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string | null> {
  if (basicToken && Date.now() < tokenExpiresAt) {
    return basicToken;
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error("Spotify credentials are not configured");
  }

  const token = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    qs.stringify({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  basicToken = res.data.access_token;
  tokenExpiresAt = Date.now() + res.data.expires_in * 1000 - 60_000;
  return basicToken;
}

getAccessToken().then(
  (token) => console.log("Spotify access token obtained", token),
  (err) => console.error("Failed to obtain Spotify access token", err)
);

async function spotifyFetch(endpoint: string): Promise<any> {
  const token = await getAccessToken();

  const res = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

const SpotifyService = {
  search: (query: string) =>
    spotifyFetch(
      `search?q=${encodeURIComponent(query)}&type=artist,track,album`
    ),
  getArtist: (id: string) => spotifyFetch(`artists/${id}`),
  getTopTracks: (id: string) =>
    spotifyFetch(`artists/${id}/top-tracks?market=US`),
  getAlbums: (id: string) =>
    spotifyFetch(`artists/${id}/albums?include_groups=album,single&market=US`),
};

export default SpotifyService;

