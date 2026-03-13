import {Request, Response, NextFunction} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import {generateAccessToken, generateRefreshToken} from "../utils/generateToken";
import {deleteRefreshToken, getRefreshToken, saveRefreshToken,} from "./refreshToken-controller";
import {Role} from "../tsModels/enums";
import {AppError} from "../utils/errorMiddleware";
import {env} from "../utils/configService";
import { randomUUID } from "crypto";
import {hashToken} from "../utils/hashToken";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}

const cookieOptions = (_req: Request): CookieOptions => {
  const isProd = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge:  24 * 60 * 60 * 1000,
  };
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, email, password, admin_key } = req.body;

    if (!username || !email || !password) {
      throw new AppError("username, email and password are required", 400)
    }

    let assignedRole = Role.USER;
    if (admin_key === env.ADMIN_KEY) {
      assignedRole = Role.ADMIN;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("User with this email already exists", 409)
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

    // Create a session id and refresh token and persist it before setting the access token cookie
    const sessionId = randomUUID();
    const refreshToken = generateRefreshToken(userId, sessionId);
    await saveRefreshToken(userId, refreshToken, sessionId);

    const accessToken = generateAccessToken({
      ...newUser.toObject(),
      _id: userId,
    });

    // Set access token and session id cookies after refresh token is saved
    res.cookie("access_token", accessToken, cookieOptions(req));


    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

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
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("email and password are required", 400)
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password", 401)
    }

    const userId = user?.id?.toString() || user?._id?.toString();

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401)
    }

    // Create & persist refresh token before sending access token cookie (login flow)
    const sessionId = randomUUID();
    const refreshToken = generateRefreshToken(userId, sessionId);
    await saveRefreshToken(userId, refreshToken, sessionId);

    const accessToken = generateAccessToken({
      ...user.toObject(),
      _id: userId,
    });

    res.cookie("access_token", accessToken, cookieOptions(req));

    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

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
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.access_token;
    if (token && env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
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
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("session_id", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ success: true, message: "Logged out", data: {} });
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401)
    }

    const userId = req.user?.id?.toString() || req.user?._id?.toString();
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      throw new AppError("User not found", 404)
    }

    res.status(200).json({
      success: true,
      message: "Current user",
      data: user,
    });
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const users = await User.find().select("-passwordHash");
    res.status(200).json({
      success: true,
      message: "All users",
      data: users,
    });
}
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
     const { refreshToken } = req.body;

     if (!refreshToken) {
       throw new AppError("Refresh token is required", 400)
     }

     const decoded = await jwt.verify(refreshToken, env.JWT_REFRESH_SECRET!) as any;
     const userId = decoded?.id?.toString() || decoded?._id?.toString();
     const sessionId = decoded?.sessionId;

     if (!userId || !sessionId) {
       throw new AppError("Invalid refresh token", 401)
     }


   const tokenHash = await hashToken(refreshToken);
     const refreshTokenFromDb = await getRefreshToken(tokenHash);

     if (!refreshTokenFromDb) {
       throw new AppError("Refresh token expired or invalid", 401);
     }

     if (refreshTokenFromDb.sessionId !== sessionId) {
       throw new AppError("Refresh token mismatch", 401)
     }

     const user = await User.findById(userId);
     if (!user) {
       throw new AppError("User not found", 401)
     }

    const newRefreshToken = generateRefreshToken(userId, sessionId);
    await saveRefreshToken(userId, newRefreshToken, sessionId);

    const newAccessToken = generateAccessToken({
      ...user.toObject(),
      _id: userId,
    });

    // Set new access token cookie (and re-set session cookie to refresh its flags/expiry)
    res.cookie("access_token", newAccessToken, cookieOptions(req));
    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {
        refreshToken: newRefreshToken,
      },
    });
};
