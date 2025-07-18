const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Song title is required"],
    trim: true,
    maxLength: [100, "Song title can not be more than 100 characters"],
  },
  year: {
    type: Number,
    required: [true, "Release year is required"],
    min: [1000, "Year must be at least 1000"],
    max: [new Date().getFullYear(), "Year cannot be in the future"],
  },
  link: {
    type: String,
    required: [true, "Link is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Song", SongSchema);
