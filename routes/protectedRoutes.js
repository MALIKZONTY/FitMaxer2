const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../middlewares/authMiddleware');

router.get('/protected', verifyUserToken, (req, res) => {
  res.json({
    message: 'Authenticated access successful ✅',
    user: req.user
  });
});

module.exports = router;
