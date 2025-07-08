const express = require('express');
const router = express.Router();
const { logWorkoutStatus } = require('../controllers/workoutController');

router.post('/:uid/:date', logWorkoutStatus);

module.exports = router;
