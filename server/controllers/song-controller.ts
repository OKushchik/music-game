import {NextFunction, Request, Response} from "express";
import Song from "../models/song";
import {AppError} from "../utils/errorMiddleware";


export const getAllSongs = async (req: Request, res: Response): Promise<void> => {
    const allSongs = await Song.find({});
    if (allSongs?.length > 0) {
      res.status(200).json({
        success: true,
        message: "List of Songs fetched successfully",
        data: allSongs,
        user: req.user || {},
      });
    } else {
      throw new AppError("No Songs found in collection", 404)
    }
};

export const getSingleSongById = async (
  req: Request,
  res: Response,
): Promise<void> => {
    const getCurrentSongId = req.params.id;
    const songDetailsByID = await Song.findById(getCurrentSongId);

    if (!songDetailsByID) {
      throw new AppError("Song with the current ID is not found! Please try with a different ID", 404)
    }

    res.status(200).json({
      success: true,
      message: "Success song by id",
      data: songDetailsByID,
    });
};

export const addNewSong = async (req: Request, res: Response): Promise<void> => {
    const newSongData = req.body;
    const newlyCreatedSong = await Song.create(newSongData);
    if (newlyCreatedSong) {
      res.status(201).json({
        success: true,
        message: "Song added successfully",
        data: newlyCreatedSong,
      });
    } else {
      throw new AppError("Songs was not added", 404)
    }
};

export const updateSong = async (req: Request, res: Response): Promise<void> => {
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
      throw new AppError("Song is not found with this ID", 404);
    }

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      data: updatedSong,
    });
};

export const deleteSong = async (req: Request, res: Response): Promise<void> => {
    const getCurrentSongId = req.params.id;
    const deletedSong = await Song.findByIdAndDelete(getCurrentSongId);

    if (!deletedSong) {
      throw new AppError("Song is not found with this ID", 404);
    }

    res.status(200).json({
      success: true,
      message: "Song deleted",
      data: deletedSong,
    });
};

export const deleteManySongs = async (
  req: Request,
  res: Response,
): Promise<void> => {
    const ids = req.body.data.ids;

    if (!Array.isArray(ids)) {
      throw new AppError("IDs must be an array", 400);
    }

    const deletedSongs = await Song.deleteMany({
      _id: { $in: ids },
    }).catch((error) => console.log(error));

    if (!deletedSongs) {
      throw new AppError("Songs are not found", 404)
    }

    res.status(200).json({
      success: true,
      message: "Songs deleted",
      data: deletedSongs,
    });
};

