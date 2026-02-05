import jwt, {Secret, SignOptions} from "jsonwebtoken";
import {UserPayload} from "../tsModels/interfaces";

export const generateAccessToken = (user: UserPayload): string => {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  if (!user) throw new Error("No user provided for token generation");

  const userId = user._id?.toString() || user.id?.toString();
  if (!userId) throw new Error("User id is missing");

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];

  return jwt.sign(
    { id: userId, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET as Secret;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not defined");

  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? "15d") as SignOptions["expiresIn"];

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

