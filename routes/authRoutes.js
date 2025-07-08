const express = require('express');
const router = express.Router();
const {
  signupUser,
  loginUser,
  logoutUser
} = require('../controllers/authController');

router.post('/signup', signupUser);
router.post('/login', loginUser);     // NEW
router.post('/logout', logoutUser);   // NEW

module.exports = router;
