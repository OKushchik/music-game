const express = require('express');
const {
  spotifySearch,
  spotifyArtist,
  spotifyArtistTopTracks,
  spotifyArtistAlbums
} = require("../controllers/spotify-controller");
const router = express.Router();

// start with route => /spotify

router.get("/search", spotifySearch);
router.get("/artist/:id", spotifyArtist);
router.get("/artist/:id/top-tracks", spotifyArtistTopTracks);
router.get("/artist/:id/albums", spotifyArtistAlbums);

module.exports = router;
