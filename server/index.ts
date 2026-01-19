import "dotenv/config";import "./tsModels/express";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectToDB from "./database/db";
import songRoutes from "./routes/song-routes";
import spotifyRoutes from "./routes/spotify-routes";
import authRoutes from "./routes/auth-routes";
import { authGuard } from "./utils/middleware";

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_SECRET OR JWT_REFRESH_SECRET is not defined in environment variables.");
}

const app: Express = express();
const PORT = process.env.PORT || 8080;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// routes here
app.use("/songs", authGuard, songRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});

connectToDB().then(r => console.log("Connected to DB")).catch(e => console.log("DB connection error:", e));
