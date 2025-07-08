const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();


// SIGNUP
exports.signupUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const usersRef = admin.database().ref('users');
    const existingUsersSnap = await usersRef.orderByChild('email').equalTo(email).once('value');

    if (existingUsersSnap.exists()) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserRef = usersRef.push();
    const userId = newUserRef.key;

    const userData = {
      uid: userId,
      email,
      name,
      password: hashedPassword
    };

    await newUserRef.set(userData);

    const token = jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '24h' });

    // Since this is a new user, no diet plan will exist yet.
    const noDietPlan = true;

    res.status(201).json({ message: 'User created', uid: userId, accessToken: token, noDietPlan });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const usersRef = admin.database().ref('users');
    const usersSnap = await usersRef.orderByChild('email').equalTo(email).once('value');

    if (!usersSnap.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    let foundUser = null;
    let uid = null;

    usersSnap.forEach(child => {
      uid = child.key;
      foundUser = child.val();
    });

    if (!foundUser || !uid) {
      return res.status(500).json({ error: 'User data retrieval failed' });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: uid }, process.env.SECRET_KEY, { expiresIn: '24h' });

    // Check if diet plans exist
    const dietPlansRef = admin.database().ref(`users/${uid}/plans/dietPlans`);
    const dietPlansSnap = await dietPlansRef.once('value');
    const noDietPlan = !dietPlansSnap.exists();

    res.status(200).json({
      message: 'Login successful',
      uid,
      accessToken: token,
      noDietPlan
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};


// LOGOUT (Client-Side Token Removal)
exports.logoutUser = (req, res) => {
  // On client side, just delete the token
  res.status(200).json({ message: 'Logout successful. Please delete token on client.' });
};
