const express = require('express');
const router = express.Router();
//const { calculateCalories } = require('../controllers/calorieController');

//router.post('/lookup', calculateCalories);


const { getCalorieInfo } = require('../controllers/calorieController');
const { verifyUserToken } = require('../middlewares/authMiddleware');

// POST /api/calorie-chatbot
router.post('/calorie-chatbot', verifyUserToken, getCalorieInfo);

module.exports = router;
