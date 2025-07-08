/*
const express = require('express');
const router = express.Router();
const { saveUserProfileAndGeneratePlan } = require('../controllers/onboardController');

router.post('/onboard/:uid', saveUserProfileAndGeneratePlan);

module.exports = router;
*/

const express = require('express');
const router = express.Router();
const { saveUserProfileAndGeneratePlan } = require('../controllers/onboardController');
const { verifyUserToken } = require('../middlewares/authMiddleware'); // ⬅️ import middleware

// ✅ Remove :uid and protect with verifyToken
router.post('/onboard', verifyUserToken, saveUserProfileAndGeneratePlan);

module.exports = router;
