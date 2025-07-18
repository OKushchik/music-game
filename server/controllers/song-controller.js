const Song = require("../models/song");

const getAllSongs = async (req, res) => {
  try {
    const allSongs = await Song.find({});
    if (allSongs?.length > 0) {
      res.status(200).json({
        success: true,
        message: "List of Songs fetched successfully",
        data: allSongs,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No Songs found in collection",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};
const getSingleSongById = async (req, res) => {
  try {
    const getCurrentSongId = req.params.id;
    const songDetailsByID = await Song.findById(getCurrentSongId);

    if (!songDetailsByID) {
      return res.status(404).json({
        success: false,
        message:
          "Song with the current ID is not found! Please try with a different ID",
      });
    }

    res.status(200).json({
      success: true,
      data: songDetailsByID,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};
const addNewSong = async (req, res) => {
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
    });
  }
};
const updateSong = async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: "Song is not found with this ID",
      });
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
    });
  }
};
const deleteSong = async (req, res) => {
  try {
    const getCurrentSongId = req.params.id;
    const deletedSong = await Song.findByIdAndDelete(getCurrentSongId);

    if (!deletedSong) {
      return res.status(404).json({
        success: false,
        message: "Song is not found with this ID",
      });
    }

    res.status(200).json({
      success: true,
      data: deletedSong,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

module.exports = {
  getAllSongs,
  getSingleSongById,
  addNewSong,
  updateSong,
  deleteSong
};
