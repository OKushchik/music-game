require("dotenv").config();
const express = require("express");
const connectToDB = require("./database/db");
const songRoutes = require("./routes/song-routes");

const app = express();
const PORT = process.env.PORT || 3000;


//middleware -> express.json()
app.use(express.json());

//routes here
app.use("/api/songs", songRoutes);
app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});

connectToDB();
