import express, { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/user-controller";
import { authGuard } from "../utils/middleware";
import { AppError } from "../utils/errorMiddleware";

const router: Router = express.Router();

// start with route => /auth
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.get("/me", authGuard, getCurrentUser);
router.post("/refresh", refreshAccessToken);

export default router;
