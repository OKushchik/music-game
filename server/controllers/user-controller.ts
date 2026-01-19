import {Request, Response} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import {generateAccessToken, generateRefreshToken} from "../utils/generateToken";
import {deleteRefreshToken, getRefreshToken, saveRefreshToken,} from "./refreshToken-controller";
import {Role} from "../tsModels/enums";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}

const cookieOptions = (req: Request): CookieOptions => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  };
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, admin_key } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: "username, email and password are required",
        data: {},
      });
      return;
    }

    let assignedRole = Role.USER;
    if (admin_key === process.env.ADMIN_KEY) {
      assignedRole = Role.ADMIN;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
        data: {},
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: username,
      email,
      passwordHash,
      role: assignedRole,
    });

    const userId = newUser._id?.toString() || newUser.id.toString();

    const accessToken = generateAccessToken(
      {
        ...newUser.toObject(),
        _id: userId,
      }
    );
    const refreshToken = generateRefreshToken(userId);
    await saveRefreshToken(userId, refreshToken);

    res.cookie("access_token", accessToken, cookieOptions(req));

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: userId,
        fullName: newUser.fullName,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl || null,
        role: newUser.role,
        refreshToken: refreshToken,
      },
    });
  } catch (e: any) {
    console.error(e);
    if (e.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
        data: e.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Registration failed! Please try again",
      data: {},
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "email and password are required",
        data: {},
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: {},
      });
      return;
    }

    const userId = user?.id?.toString() || user?._id?.toString();

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: {},
      });
      return;
    }

    const accessToken = generateAccessToken({
      ...user.toObject(),
      _id: userId,
    });
    const refreshToken = generateRefreshToken(userId);

    await saveRefreshToken(userId, refreshToken);

    res.cookie("access_token", accessToken, cookieOptions(req));

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        refreshToken: refreshToken,
      },
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Login failed! Please try again",
      data: {},
    });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.access_token;
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        const userId = decoded?.id?.toString() || decoded?._id?.toString();
        if (userId) {
          await deleteRefreshToken(userId);
        }
      } catch (err: any) {
        console.error("Token verification in logout:", err.message);
      }
    }
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ success: true, message: "Logged out", data: {} });
  } catch (e: any) {
    console.error("Logout error:", e);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      data: {},
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: {},
      });
      return;
    }
    const userId = req.user?.id?.toString() || req.user?._id?.toString();
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Current user",
      data: user,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      data: {},
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
        data: {},
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    const userId = decoded?.id?.toString() || decoded?._id?.toString();

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        data: {},
      });
      return;
    }

    const storedToken = await getRefreshToken(userId);
    if (!storedToken || storedToken !== refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token expired or invalid",
        data: {},
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
        data: {},
      });
      return;
    }

    const newAccessToken = generateAccessToken({
      ...user.toObject(),
      _id: userId,
    });

    res.cookie("access_token", newAccessToken, cookieOptions(req));

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {},
    });
  } catch (e: any) {
    console.error(e);
    res.status(401).json({
      success: false,
      message: "Failed to refresh token",
      data: {},
    });
  }
};

