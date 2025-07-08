const admin = require('firebase-admin');

exports.logWorkoutStatus = async (req, res) => {
  const { uid, date } = req.params;
  const { completed, caloriesBurned } = req.body;

  const ref = admin.database().ref(`users/${uid}/workoutTracking/${date}`);
  await ref.set({ completed, caloriesBurned });

  res.status(200).json({ message: 'Workout status recorded' });
};
