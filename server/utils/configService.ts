export const env = {
  PORT: process.env.PORT || "8080",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  MONGO_DB_KEY: process.env.MONGO_DB_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "15d",
  ADMIN_KEY: process.env.ADMIN_KEY,
  SPOTIFY_URL: process.env.SPOTIFY_URL,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
}
