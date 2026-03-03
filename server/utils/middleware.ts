import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {Role} from "../tsModels/enums";
import {env} from "./configService";

export const authGuard = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.access_token;

  if (!token) {
    res.status(401).json({ success: false, message: "No access token", data: {} });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET!);
    req.user = payload as Express.Request["user"];
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired access token", data: {} });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  console.log("requireAdmin - req.user:", req.user);
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized", data: {} });
    return;
  }
  if (req.user.role !== Role.ADMIN) {
    res.status(403).json({ success: false, message: "Admin role required", data: {} });
    return;
  }

  next();
};

