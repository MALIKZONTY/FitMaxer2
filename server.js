require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');


const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
// Fix PEM newlines if needed
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}


const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});


// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/onboardRoutes'));
app.use('/user', require('./routes/planRoutes'));
app.use('/diet', require('./routes/dietRoutes'));
app.use('/workout', require('./routes/workoutRoutes'));
app.use('/calories', require('./routes/calorieRoutes'));
app.use('/summary', require('./routes/summaryRoutes'));

app.use('/', require('./routes/protectedRoutes'));    

app.use('/user', require('./routes/userRoutes'));


app.use("/api/streak", require("./routes/streakRoutes"));


app.use('/plans', require('./routes/routineRoutes'));



const progressRoutes = require('./routes/progressRoutes');
app.use('/progress', progressRoutes); // 👈 Prefix for progress endpoints


const newStreakRoutes = require('./routes/newStreakRoutes');
app.use('/plans', newStreakRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`FitMaxer backend running on port ${PORT}`));
