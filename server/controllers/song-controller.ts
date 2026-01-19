import { Request, Response } from "express";
import Song from "../models/song";


export const getAllSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const allSongs = await Song.find({});
    if (allSongs?.length > 0) {
      res.status(200).json({
        success: true,
        message: "List of Songs fetched successfully",
        data: allSongs,
        user: req.user || {},
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No Songs found in collection",
        data: [],
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
      data: [],
    });
  }
};

export const getSingleSongById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const getCurrentSongId = req.params.id;
    const songDetailsByID = await Song.findById(getCurrentSongId);

    if (!songDetailsByID) {
      res.status(404).json({
        success: false,
        data: {},
        message:
          "Song with the current ID is not found! Please try with a different ID",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Success song by id",
      data: songDetailsByID,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
      data: {},
    });
  }
};

export const addNewSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const newSongData = req.body;
    const newlyCreatedSong = await Song.create(newSongData);
    if (newlyCreatedSong) {
      res.status(201).json({
        success: true,
        message: "Song added successfully",
        data: newlyCreatedSong,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
      data: {},
    });
  }
};

export const updateSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedSongData = req.body;
    const getCurrentSongId = req.params.id;
    const updatedSong = await Song.findByIdAndUpdate(
      getCurrentSongId,
      updatedSongData,
      {
        new: true,
      }
    );

    if (!updatedSong) {
      res.status(404).json({
        success: false,
        message: "Song is not found with this ID",
        data: {},
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      data: updatedSong,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
      data: {},
    });
  }
};

export const deleteSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const getCurrentSongId = req.params.id;
    const deletedSong = await Song.findByIdAndDelete(getCurrentSongId);

    if (!deletedSong) {
      res.status(404).json({
        success: false,
        message: "Song is not found with this ID",
        data: {},
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Song deleted",
      data: deletedSong,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
      data: {},
    });
  }
};

export const deleteManySongs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const ids = req.body.data.ids;

    if (!Array.isArray(ids)) {
      res.status(400).json({ success: false, message: ids });
      return;
    }

    const deletedSongs = await Song.deleteMany({
      _id: { $in: ids },
    }).catch((error) => console.log(error));

    if (!deletedSongs) {
      res.status(404).json({
        success: false,
        message: "Songs are not found",
        data: [],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Songs deleted",
      data: deletedSongs,
    });
  } catch (error) {
    console.error("Error deleting songs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: [],
    });
  }
};

