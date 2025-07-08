const express = require('express');
const router = express.Router();
const { getStreakData } = require('../controllers/newStreakController');
const { verifyToken } = require('../middleware/auth');

router.get('/streak', verifyToken, getStreakData);

module.exports = router;
