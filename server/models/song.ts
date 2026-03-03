import mongoose, { Schema, Document } from "mongoose";

interface ISong extends Document {
  title: string;
  year: number;
  link: string;
  createdAt: Date;
}

const SongSchema = new Schema<ISong>(
  {
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
  },
  { timestamps: false }
);

export default mongoose.model<ISong>("Song", SongSchema);

