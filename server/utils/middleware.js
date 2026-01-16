const jwt = require("jsonwebtoken");
const { getRefreshToken } = require("../controllers/refreshToken-controller");

const authGuard = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No access token', data: {} });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured', data: {} });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token', data: {} });
  }
};

const refreshGuard = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.access_token;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (err) {
        console.error('Access token verification failed:', err.message);
      }
    }

    const userId = req.body?.userId || req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found', data: {} });
    }

    const storedToken = await getRefreshToken(userId.toString());
    if (!storedToken) {
      return res.status(401).json({ success: false, message: 'Refresh token expired or not found', data: {} });
    }

    req.user = { id: userId };
    next();
  } catch (err) {
    console.error('refreshGuard error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid refresh token', data: {} });
  }
};

const requireAdmin = (req, res, next) => {
  console.log('requireAdmin - req.user:', req.user);
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized', data: {} });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin role required', data: {} });
  }

  next();
};

module.exports = {
  authGuard,
  refreshGuard,
  requireAdmin
};
