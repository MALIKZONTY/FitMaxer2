const express = require('express');
const router = express.Router();
const { logMealStatus } = require('../controllers/dietController');
const { getDietSummary } = require('../controllers/dietController');
const { verifyUserToken } = require('../middlewares/authMiddleware');


router.post('/:date', verifyUserToken, logMealStatus);


router.get('/summary/:date', verifyUserToken, getDietSummary);


module.exports = router;
