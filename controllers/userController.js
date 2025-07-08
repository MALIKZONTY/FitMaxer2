const admin = require('firebase-admin');

exports.getUserProfile = async (req, res) => {
  try {
    const { uid } = req.user;

    const userRef = admin.database().ref(`users/${uid}`);
    const userSnap = await userRef.once('value');
    const userData = userSnap.val();

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, profile } = userData;

    res.status(200).json({
      uid,
      name: name || '',
      email: email || '',
      profile: profile || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
