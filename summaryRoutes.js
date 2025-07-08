const express = require('express');
const router = express.Router();
const { updateDailySummary } = require('../controllers/summaryController');

router.post('/:uid/:date', updateDailySummary);



const { getCumulativeSummary } = require('../controllers/summaryController');

router.get('/total/:uid', getCumulativeSummary);



module.exports = router;
