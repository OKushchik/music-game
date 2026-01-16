const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { saveRefreshToken, getRefreshToken, deleteRefreshToken } = require("./refreshToken-controller");

const cookieOptions = (req) => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
  };
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, admin_key } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email and password are required",
        data: {},
      });
    }

    let assignedRole = "user";
    if (admin_key === process.env.ADMIN_KEY) {
      assignedRole = "admin";
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
        data: {},
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: username,
      email,
      passwordHash,
      role: assignedRole,
    });

    const userId = newUser?.userId || newUser?.id || newUser?._id;

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(userId);
    await saveRefreshToken(userId.toString(), refreshToken);

    res.cookie("access_token", accessToken, cookieOptions(req));

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: userId,
        fullName: newUser.fullName,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl || null,
        role: newUser.role,
      },
    });
  } catch (e) {
    console.error(e);
    if (e.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user data",
        data: e.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed! Please try again",
      data: {},
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
        data: {},
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: {},
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: {},
      });
    }

    const accessToken = generateAccessToken(user);


    const userId = user?.userId || user?.id || user?._id;

    const refreshToken = generateRefreshToken(userId);
    console.log('Generated refresh token:', refreshToken);
    await saveRefreshToken(userId.toString(), refreshToken);

    res.cookie("access_token", accessToken, cookieOptions(req));

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        refreshToken: refreshToken
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Login failed! Please try again",
      data: {},
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded?.userId || decoded?.id || decoded?._id;
        if (userId) {
          await deleteRefreshToken(userId.toString());
        }
      } catch (err) {
        console.error('Token verification in logout:', err.message);
      }
    }
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return res.status(200).json({ success: true, message: 'Logged out', data: {} });
  } catch (e) {
    console.error('Logout error:', e);
    return res.status(500).json({ success: false, message: 'Logout failed', data: {} });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: {} });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: {} });
    }

    return res.status(200).json({ success: true, message: 'Current user', data: user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Failed to get user', data: {} });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.body?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not found", data: {} });
    }

    const storedToken = await getRefreshToken(userId.toString());
    if (!storedToken) {
      return res.status(401).json({ success: false, message: "Refresh token expired or not found", data: {} });
    }

    const newAccessToken = generateAccessToken({ _id: userId });

    res.cookie("access_token", newAccessToken, cookieOptions(req));

    return res.status(200).json({ success: true, message: "Token refreshed", data: {} });
  } catch (e) {
    console.error(e);
    return res.status(401).json({
      success: false,
      message: "Failed to refresh token",
      data: {},
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken };
