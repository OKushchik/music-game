require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const connectToDB = require("./database/db");
const songRoutes = require("./routes/song-routes");
const spotifyRoutes = require('./routes/spotify-routes');
const authRoutes = require('./routes/auth-routes');

const app = express();
const PORT = process.env.PORT || 8080;

const CLIENT_URL = process.env.CLIENT_URL || 'http://10.17.105.43:3000';

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// routes here
app.use("/songs", songRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});

connectToDB();
