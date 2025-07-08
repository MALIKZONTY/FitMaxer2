const express = require("express");
const router = express.Router();
const { evaluateAndUpdateStreak } = require("../controllers/streakController");
const { verifyUserToken } = require('../middlewares/authMiddleware');

router.get("/evaluate/:userId/:date", verifyUserToken, evaluateAndUpdateStreak);

module.exports = router;
