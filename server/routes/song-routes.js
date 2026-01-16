const express = require("express");
const {
  getAllSongs,
  addNewSong,
  updateSong,
  deleteSong,
  deleteManySongs,
  getSingleSongById
} = require("../controllers/song-controller");

const { requireAdmin, authGuard} = require('../utils/middleware');

const router = express.Router();


// start with route => /SongsApiHooks/songs
router.get("/get", getAllSongs);
router.get("/get/:id", getSingleSongById);
router.post("/add", addNewSong);
router.put("/update/:id", updateSong);
router.delete("/delete/:id", requireAdmin, deleteSong);
router.delete("/delete-many", requireAdmin, deleteManySongs);

module.exports = router;
