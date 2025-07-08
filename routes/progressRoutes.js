const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  markMealCompleted,
  markWorkoutCompleted
} = require('../controllers/progressController');

// Mark a meal (e.g., Breakfast, Lunch, Dinner) as completed
router.post('/meal-completed/:mealName', verifyToken, markMealCompleted);

// Mark workout as completed
router.post('/workout-completed', verifyToken, markWorkoutCompleted);

module.exports = router;
