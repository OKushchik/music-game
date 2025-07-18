const express = require("express");
const {
  getAllSongs,
  addNewSong,
  updateSong,
  deleteSong,
  getSingleSongById
} = require("../controllers/song-controller");


const router = express.Router();

router.get("/get", getAllSongs);
router.get("/get/:id", getSingleSongById);
router.post("/add", addNewSong);
router.put("/update/:id", updateSong);
router.delete("/delete/:id", deleteSong);

module.exports = router;
