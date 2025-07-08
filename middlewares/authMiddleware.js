const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyUserToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    req.user = { uid: decodedToken.userId }; // attach user info to request
    next();
  } catch (err) {
    console.error('Error verifying auth token:', err);
    res.status(401).json({ error: 'Unauthorized - Invalid token', details: err.message });
  }
};
