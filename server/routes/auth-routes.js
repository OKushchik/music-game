const express = require("express");
const { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken } = require("../controllers/user-controller");
const { authGuard, refreshGuard } = require("../utils/middleware");

const router = express.Router();

// start with route => /auth
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.get('/me', authGuard, getCurrentUser);
router.post("/refresh", refreshGuard, refreshAccessToken);

module.exports = router;
