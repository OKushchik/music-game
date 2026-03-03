import express, { Router } from "express";
import {
  getAllSongs,
  addNewSong,
  updateSong,
  deleteSong,
  deleteManySongs,
  getSingleSongById,
} from "../controllers/song-controller";
import { requireAdmin, authGuard } from "../utils/middleware";

const router: Router = express.Router();

// start with route => /songs
router.get("/get", getAllSongs);
router.get("/get/:id", getSingleSongById);
router.post("/add", addNewSong);
router.put("/update/:id", updateSong);
router.delete("/delete/:id", requireAdmin, deleteSong);
router.delete("/delete-many", requireAdmin, deleteManySongs);

export default router;

