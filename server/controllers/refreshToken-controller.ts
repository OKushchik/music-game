import RefreshToken from "../models/refreshToken";

export const saveRefreshToken = async (
  userId: string,
  token: string
): Promise<boolean> => {
  try {

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.findOneAndUpdate(
      { userId },
      { $set: { token, expiresAt } },
      { upsert: true, new: true }
    );
    return true;
  } catch (err) {
    console.error("Error saving refresh token:", err);
    return false;
  }
};

export const getRefreshToken = async (userId: string): Promise<string | null> => {
  try {
    const refreshToken = await RefreshToken.findOne({ userId });
    return refreshToken ? refreshToken.token : null;
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

