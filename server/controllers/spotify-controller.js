const SpotifyService  = require("../services/spotifyService");

const spotifySearch = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const results = await SpotifyService.search(q);
    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Spotify search failed' });
  }
};

const spotifyArtist = async (req, res) => {
  try {
    const artist = await SpotifyService.getArtist(req.params.id);
    res.json(artist);
  } catch (err) {
    res.status(500).json({ error: 'Artist fetch failed' });
  }
}

const spotifyArtistTopTracks = async (req, res) => {
  try {
    const tracks = await SpotifyService.getTopTracks(req.params.id);
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: 'Top tracks fetch failed' });
  }
}

const   spotifyArtistAlbums = async (req, res) => {
  try {
    const albums = await SpotifyService.getAlbums(req.params.id);
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: 'Albums fetch failed' });
  }
}

module.exports = {
  spotifySearch,
  spotifyArtist,
  spotifyArtistTopTracks,
  spotifyArtistAlbums
}
