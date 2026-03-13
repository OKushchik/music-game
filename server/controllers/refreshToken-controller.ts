import RefreshToken, {RefreshTokenDoc} from "../models/refreshToken";
import {hashToken} from "../utils/hashToken";
import {AppError} from "../utils/errorMiddleware";

export const saveRefreshToken = async (
  userId: string,
  token: string,
  sessionId: string
): Promise<boolean> => {
  try {

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const tokenHash = await hashToken(token);

    await RefreshToken.findOneAndUpdate(
      { userId, sessionId },
      { $set: { tokenHash, expiresAt } },
      { upsert: true, new: true }
    );

    return true;
  } catch (err: any) {
    throw new AppError("Error saving refresh token", 500);
  }
};

export const getRefreshToken = async (refreshHash: string): Promise<RefreshTokenDoc | null> => {
  try {
    return await RefreshToken.findOne({
      tokenHash: refreshHash
    });
  } catch (err) {
    throw new AppError("Error getting refresh token", 500);
  }
};

export const deleteRefreshToken = async (userId: string): Promise<boolean> => {
  try {
    await RefreshToken.deleteMany({ userId });
    return true;
  } catch (err: any) {
    throw new AppError("Error deleting refresh tokens", 500);
  }
};
