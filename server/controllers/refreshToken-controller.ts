import RefreshToken, {RefreshTokenDoc} from "../models/refreshToken";
import {hash} from "node:crypto";
import {hashToken} from "../utils/hashToken";

export const saveRefreshToken = async (
  userId: string,
  token: string,
  sessionId: string
): Promise<boolean> => {
  try {

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);



    await RefreshToken.findOneAndUpdate(
      { userId, sessionId },
      { $set: { tokenHash: hashToken(token), expiresAt } },
      { upsert: true, new: true }
    );
    return true;
  } catch (err) {
    console.error("Error saving refresh token:", err);
    return false;
  }
};

export const getRefreshToken = async (refreshHash: string): Promise<RefreshTokenDoc | null> => {
  try {
    return await RefreshToken.findOne({
      tokenHash: refreshHash,
      revokedAt: null,
    });
  } catch (err) {
    console.error("Error getting refresh token:", err);
    return null;
  }
};

export const deleteRefreshToken = async (userId: string): Promise<boolean> => {
  try {
    await RefreshToken.deleteMany({ userId });
    return true;
  } catch (err) {
    console.error("Error deleting refresh token:", err);
    return false;
  }
};

