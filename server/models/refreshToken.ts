import mongoose, {Schema, Document, HydratedDocument} from "mongoose";

interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  tokenHash: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    tokenHash: { type: String, unique: true, index: true, required: true },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
  },
  { timestamps: true }
);

export type RefreshTokenDoc = HydratedDocument<IRefreshToken>;
export default mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);

