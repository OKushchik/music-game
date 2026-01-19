import express, { Router } from "express";
import {
  spotifySearch,
  spotifyArtist,
  spotifyArtistTopTracks,
  spotifyArtistAlbums,
} from "../controllers/spotify-controller";

const router: Router = express.Router();

// start with route => /spotify
router.get("/search", spotifySearch);
router.get("/artist/:id", spotifyArtist);
router.get("/artist/:id/top-tracks", spotifyArtistTopTracks);
router.get("/artist/:id/albums", spotifyArtistAlbums);

export default router;

