import "dotenv/config";
import "./tsModels/express";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import connectToDB from "./database/db";
import errorHandler from "./utils/errorMiddleware";
import songRoutes from "./routes/song-routes";
import spotifyRoutes from "./routes/spotify-routes";
import authRoutes from "./routes/auth-routes";
import { authGuard } from "./utils/middleware";
import http from "http";
import { initSocket } from "./lib/socket";
import RefreshToken from "./models/refreshToken";
import {checkEnvVariables, env} from "./utils/configService";


checkEnvVariables();

const app: Express = express();
const PORT = Number(env.PORT) || 8080;

const CLIENT_URL = env.CLIENT_URL || "http://localhost:3000";

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));

cron.schedule('10 12 * * *', async () => {
  const now = new Date();
  try {
    const result = await RefreshToken.deleteMany({ expiresAt: { $lt: now } });
    console.log(`[CRON] Deleted expired refresh tokens: ${result.deletedCount}`);
  } catch (err) {
    console.error('[CRON] Cleanup failed:', err);
  }
});

// routes here
app.use("/songs", authGuard, songRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server (HTTP + Socket.IO) is now running on port ${PORT}`);
});

connectToDB()
  .then(() => console.log("Connected to DB"))
  .catch((e) => console.log("DB connection error:", e));
