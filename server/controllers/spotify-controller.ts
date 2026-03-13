import {NextFunction, Request, Response} from "express";
import SpotifyService from "../services/spotifyService";
import {AppError} from "../utils/errorMiddleware";

export const spotifySearch = async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;
  if (!q) {
    throw new AppError("Missing query", 400)
  }

  const results = await SpotifyService.search(q as string);

  if(!results) {
    throw new AppError("No results found", 404)
  }

  res.json(results);
};

export const spotifyArtist = async (req: Request, res: Response): Promise<void> => {
  const artist = await SpotifyService.getArtist(req.params.id);
  if(!artist) {
      throw new AppError("Artist not found", 404)
  }
  res.json(artist);
};

export const spotifyArtistTopTracks = async (
  req: Request,
  res: Response
): Promise<void> => {
    const tracks = await SpotifyService.getTopTracks(req.params.id);
    if(!tracks) {
      throw new AppError("Top tracks not found", 404)
    }
    res.json(tracks);
};

export const spotifyArtistAlbums = async (
  req: Request,
  res: Response
): Promise<void> => {
  const albums = await SpotifyService.getAlbums(req.params.id);
  if(!albums) {
    throw new AppError("Albums not found", 404)
  }
  res.json(albums);
};

export const spotifyPlaylist = async (
  req: Request,
  res: Response
): Promise<void> => {
  const randomList = await SpotifyService.getSpotifyPlaylist(req.params.playlist);
  if(!randomList) {
    throw new AppError("Playlist not found", 404)
  }
  res.json(randomList);
};

