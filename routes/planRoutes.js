const express = require('express');
const router = express.Router();
const { getSinglePlan } = require('../controllers/planController');
const { verifyUserToken } = require('../middlewares/authMiddleware');

router.get('/:uid/plan/:planType/:day', verifyUserToken, getSinglePlan);

module.exports = router;
