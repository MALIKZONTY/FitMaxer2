const express = require('express');
const router = express.Router();

const {
  updateDailySummary,
  getCumulativeSummary,
  getDailySummary
} = require('../controllers/summaryController');
const { verifyUserToken } = require('../middlewares/authMiddleware');

// POST to update daily summary
router.post('/update/:date', verifyUserToken, updateDailySummary);

// GET cumulative summary
router.get('/cumulative', verifyUserToken, getCumulativeSummary);

// GET daily summary
router.get('/daily/:date', verifyUserToken, getDailySummary);

module.exports = router;
