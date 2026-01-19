import { Request, Response } from "express";
import SpotifyService from "../services/spotifyService";

export const spotifySearch = async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;
  if (!q) {
    res.status(400).json({ error: "Missing query" });
    return;
  }

  try {
    const results = await SpotifyService.search(q as string);
    res.json(results);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: "Spotify search failed" });
  }
};

export const spotifyArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const artist = await SpotifyService.getArtist(req.params.id);
    res.json(artist);
  } catch (err) {
    res.status(500).json({ error: "Artist fetch failed" });
  }
};

export const spotifyArtistTopTracks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tracks = await SpotifyService.getTopTracks(req.params.id);
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: "Top tracks fetch failed" });
  }
};

export const spotifyArtistAlbums = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const albums = await SpotifyService.getAlbums(req.params.id);
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: "Albums fetch failed" });
  }
};

