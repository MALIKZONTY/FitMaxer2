const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');
const { verifyUserToken } = require('../middlewares/authMiddleware');

router.get('/profile', verifyUserToken, getUserProfile);

module.exports = router;
