const admin = require("firebase-admin");

const checkDietStatus = async (uid, date) => {
  const mealsToCheck = ['Breakfast', 'Lunch', 'Dinner'];
  let dietCompleted = true;

  for (const meal of mealsToCheck) {
    const mealSnap = await admin.database().ref(`users/${uid}/dietTracking/${date}/${meal}`).once('value');
    const mealData = mealSnap.val();

    if (!mealData) continue;

    if (!(mealData.status === "Completed" || mealData.status === "Custom")) {
      dietCompleted = false;
      break; // No need to check further if one is valid
    }
  }

  return dietCompleted;
};

const checkWorkoutStatus = async (uid, date) => {
  const workoutSnap = await admin.database().ref(`users/${uid}/workoutTracking/${date}`).once('value');
  const workoutData = workoutSnap.val();
  return workoutData?.completed === true;
};

exports.evaluateAndUpdateStreak = async (req, res) => {
  const { uid, date } = req.params;

  try {
    const userRef = admin.database().ref(`users/${uid}/streak`);
    const snapshot = await userRef.once('value');

    let userData = snapshot.exists()
      ? snapshot.val()
      : {
          goalType: 30,
          currentDay: 0,
          completedDays: 0,
          extendedGoalDay: 30,
          log: {}
        };

    const dietStatus = await checkDietStatus(uid, date);
    const workoutStatus = await checkWorkoutStatus(uid, date);

    userData.log = userData.log || {};
    userData.log[date] = {
      meals: dietStatus,
      workout: workoutStatus
    };

    userData.currentDay += 1;

    if (dietStatus && workoutStatus) {
      userData.completedDays += 1;
    } else {
      userData.extendedGoalDay += 1;
    }

    await userRef.set(userData);

    res.status(200).json({
      message: "Streak evaluated and updated successfully.",
      data: {
        currentDay: userData.currentDay,
        goalDay: userData.extendedGoalDay
      }
    });

  } catch (err) {
    console.error("Error updating streak:", err);
    res.status(500).json({ error: "Failed to evaluate streak" });
  }
};
