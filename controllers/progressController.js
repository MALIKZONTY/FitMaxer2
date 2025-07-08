const admin = require('firebase-admin');

// Utility to format today's date
const getToday = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 🔘 POST /meal-completed/:mealName
exports.markMealCompleted = async (req, res) => {
  try {
    const uid = req.userId;
    const { mealName } = req.params;
    const todayDate = getToday();

    const routineDietRef = admin.database().ref(`users/${uid}/routineDiet`);

    const snapshot = await routineDietRef.once('value');
    const allDays = snapshot.val();

    // Find the Day matching today's date
    let targetKey = null;
    for (const key in allDays) {
      if (allDays[key].date === todayDate) {
        targetKey = key;
        break;
      }
    }

    if (!targetKey) {
      return res.status(404).json({ error: 'No routine diet found for today' });
    }

    const meals = allDays[targetKey].meals || [];

    // Update only the target meal
    const updatedMeals = meals.map(meal =>
      meal.meal === mealName ? { ...meal, isDone: true } : meal
    );

    // Check if all meals are completed
    const allCompleted = updatedMeals.every(meal => meal.isDone === true);

    await routineDietRef.child(`${targetKey}/meals`).set(updatedMeals);
    await routineDietRef.child(`${targetKey}/today_diet_completed`).set(allCompleted);

    return res.status(200).json({ message: `${mealName} marked completed` });
  } catch (err) {
    console.error('Error marking meal complete:', err);
    res.status(500).json({ error: 'Failed to mark meal complete', details: err.message });
  }
};

// 🔘 POST /workout-completed
exports.markWorkoutCompleted = async (req, res) => {
  try {
    const uid = req.userId;
    const todayDate = getToday();

    const routineWorkoutRef = admin.database().ref(`users/${uid}/routineWorkout`);

    const snapshot = await routineWorkoutRef.once('value');
    const allDays = snapshot.val();

    // Find today’s entry
    let targetKey = null;
    for (const key in allDays) {
      if (allDays[key].date === todayDate) {
        targetKey = key;
        break;
      }
    }

    if (!targetKey) {
      return res.status(404).json({ error: 'No routine workout found for today' });
    }

    await routineWorkoutRef.child(`${targetKey}/today_workout_completed`).set(true);

    return res.status(200).json({ message: 'Workout marked completed' });
  } catch (err) {
    console.error('Error marking workout complete:', err);
    res.status(500).json({ error: 'Failed to mark workout complete', details: err.message });
  }
};
