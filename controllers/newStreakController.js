const admin = require('firebase-admin');

exports.getStreakData = async (req, res) => {
  try {
    const uid = req.userId; // coming from token after verifyToken middleware

    const dietRef = admin.database().ref(`users/${uid}/routineDiet`);
    const workoutRef = admin.database().ref(`users/${uid}/routineWorkout`);

    const [dietSnap, workoutSnap] = await Promise.all([
      dietRef.once('value'),
      workoutRef.once('value')
    ]);

    const dietData = dietSnap.val() || {};
    const workoutData = workoutSnap.val() || {};

    const totalDays = Object.keys(dietData).length;
    let completedDays = 0;

    for (let i = 1; i <= totalDays; i++) {
      const dayKey = `Day${i}`;
      const dietDay = dietData[dayKey];
      const workoutDay = workoutData[dayKey];

      if (
        dietDay &&
        workoutDay &&
        dietDay.today_diet_completed === true &&
        workoutDay.today_workout_completed === true
      ) {
        completedDays++;
      }
    }

    res.status(200).json({
      totalDays,
      completedDays
    });
  } catch (error) {
    console.error('Error fetching streak data:', error);
    res.status(500).json({ error: 'Failed to calculate streak data', details: error.message });
  }
};
