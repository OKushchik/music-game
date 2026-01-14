import mongoose from 'mongoose';

const SpotifyTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Number, required: true },
});

export const SpotifyToken = mongoose.model('SpotifyToken', SpotifyTokenSchema);
