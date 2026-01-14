const Song = require("../models/song");

const getAllSongs = async (req, res) => {
  try {
    const allSongs = await Song.find({});
    if (allSongs?.length > 0) {
      res.status(200).json({
        success: true,
        message: "List of Songs fetched successfully",
        data: allSongs,
        user: req.user || {}
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No Songs found in collection",
        data: []
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
      data: []
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
        data: {},
        message: "Song with the current ID is not found! Please try with a different ID",
      });
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
      data: {}
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
      data: {}
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
        data: {}
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
      data: {}
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
        data: {}
      });
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
      data: {}
    });
  }
};
const deleteManySongs = async (req, res) => {

  try {
    const ids = req.body.data.ids;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: ids });
    }

    const deletedSongs = await Song.deleteMany({ _id: { $in: ids } }).catch((error) => console.log(error))

    if (!deletedSongs) {
      return res.status(404).json({
        success: false,
        message: "Songs are not found",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Songs deleted",
      data: deletedSongs,
    });

  } catch (error) {
    console.error('Error deleting songs:', error);
    res.status(500).json({ success: false, message: 'Server error', data: [] });
  }
}

module.exports = {
  getAllSongs,
  getSingleSongById,
  addNewSong,
  updateSong,
  deleteSong,
  deleteManySongs
};
