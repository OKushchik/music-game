import {Request, Response, NextFunction} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import {generateAccessToken, generateRefreshToken} from "../utils/generateToken";
import {deleteRefreshToken, getRefreshToken, saveRefreshToken,} from "./refreshToken-controller";
import {Role} from "../tsModels/enums";
import {AppError} from "../utils/errorMiddleware";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}

const cookieOptions = (_req: Request): CookieOptions => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  };
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, admin_key } = req.body;

    if (!username || !email || !password) {
      return next(new AppError("username, email and password are required", 400));
    }

    let assignedRole = Role.USER;
    if (admin_key === process.env.ADMIN_KEY) {
      assignedRole = Role.ADMIN;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError("User with this email already exists", 409));
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
    return next(e);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("email and password are required", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const userId = user?.id?.toString() || user?._id?.toString();

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
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
    return next(e);
  }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    return next(new AppError("Logout failed", 500));
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const userId = req.user?.id?.toString() || req.user?._id?.toString();
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Current user",
      data: user,
    });
  } catch (e: any) {
    return next(e);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const userId = decoded?.id?.toString() || decoded?._id?.toString();

    if (!userId) {
      return next(new AppError("Invalid refresh token", 401));
    }

    const storedToken = await getRefreshToken(userId);
    if (!storedToken || storedToken !== refreshToken) {
      return next(new AppError("Refresh token expired or invalid", 401));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 401));
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
    return next(e);
  }
};
