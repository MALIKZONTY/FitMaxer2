const express = require('express');
const router = express.Router();
const { logMealStatus } = require('../controllers/dietController');
const { getDietSummary } = require('../controllers/dietController');


router.post('/:uid/:date', logMealStatus);


router.get('/summary/:uid/:date', getDietSummary);


module.exports = router;
