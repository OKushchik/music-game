const RefreshToken = require('../models/refreshToken');

const saveRefreshToken = async (userId, token) => {
  try {
    await RefreshToken.deleteMany({ userId });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.create({
      userId,
      token,
      expiresAt,
    });

    return true;
  } catch (err) {
    console.error('Error saving refresh token:', err);
    return false;
  }
};

const getRefreshToken = async (userId) => {
  try {
    const doc = await RefreshToken.findOne({ userId });
    return doc ? doc.token : null;
  } catch (err) {
    console.error('Error getting refresh token:', err);
    return null;
  }
};

const deleteRefreshToken = async (userId) => {
  try {
    await RefreshToken.deleteMany({ userId });
    return true;
  } catch (err) {
    console.error('Error deleting refresh token:', err);
    return false;
  }
};


module.exports = {
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken
};

