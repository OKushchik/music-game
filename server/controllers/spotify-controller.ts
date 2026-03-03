import {NextFunction, Request, Response} from "express";
import SpotifyService from "../services/spotifyService";
import {AppError} from "../utils/errorMiddleware";

export const spotifySearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { q } = req.query;
  if (!q) {
    return next(new AppError("Missing query", 400));
  }

  try {
    const results = await SpotifyService.search(q as string);
    res.json(results);
  } catch (err: any) {
    return next(err);
  }
};

export const spotifyArtist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const artist = await SpotifyService.getArtist(req.params.id);
    res.json(artist);
  } catch (err) {
    return next(err);
  }
};

export const spotifyArtistTopTracks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tracks = await SpotifyService.getTopTracks(req.params.id);
    res.json(tracks);
  } catch (err) {
    return next(err);
  }
};

export const spotifyArtistAlbums = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const albums = await SpotifyService.getAlbums(req.params.id);
    res.json(albums);
  } catch (err) {
    return next(err);
  }
};

export const spotifyPlaylist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const randomList = await SpotifyService.getSpotifyPlaylist(req.params.playlist);
    res.json(randomList);
  } catch (err) {
    return next(err);
  }
};

