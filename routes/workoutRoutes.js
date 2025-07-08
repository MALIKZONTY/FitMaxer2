const express = require('express');
const router = express.Router();
const { logWorkoutStatus } = require('../controllers/workoutController');
const { verifyUserToken } = require('../middlewares/authMiddleware');

router.post('/:date', verifyUserToken, logWorkoutStatus);

module.exports = router;
