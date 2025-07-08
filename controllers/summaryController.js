// ✅ summaryController.js
const admin = require('firebase-admin');

exports.updateDailySummary = async (req, res) => {
  const { date } = req.params;
  const { uid } = req.user;

  try {
    // 1. Get total calories gained from dietTracking
    const meals = ['Breakfast', 'Lunch', 'Dinner'];
    let totalGained = 0;

    for (const meal of meals) {
      const snap = await admin.database().ref(`users/${uid}/dietTracking/${date}/${meal}`).once('value');
      const data = snap.val();
      if (!data) continue;

      if (data.status === 'Completed') {
        totalGained += 300; // Can be replaced with actual value from diet plan
      }

      if (data.status === 'Custom' && Array.isArray(data.customItems)) {
        totalGained += data.customItems.reduce((sum, item) => sum + (item.calories || 0), 0);
      }
    }

    // 2. Get calories burned from workoutTracking
    let totalBurned = 0;
    const workoutSnap = await admin.database().ref(`users/${uid}/workoutTracking/${date}`).once('value');
    const workout = workoutSnap.val();
    if (workout && workout.completed) {
      totalBurned = workout.caloriesBurned || 0;
    }

    const net = totalGained - totalBurned;

    // 3. Save daily summary
    const summaryRef = admin.database().ref(`users/${uid}/summary`);
    await summaryRef.child(date).set({ caloriesGained: totalGained, caloriesBurned: totalBurned, net });

    // 4. Update summaryTotal
    const totalRef = admin.database().ref(`users/${uid}/summaryTotal`);
    const snapshot = await totalRef.once('value');
    const prev = snapshot.val() || 0;
    await totalRef.set(prev + net);

    res.status(200).json({
      message: 'Summary updated',
      date,
      caloriesGained: totalGained,
      caloriesBurned: totalBurned,
      net,
      cumulativeTotal: prev + net
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCumulativeSummary = async (req, res) => {
  const { uid } = req.user;

  try {
    const summaryRef = admin.database().ref(`users/${uid}/summary`);
    const snapshot = await summaryRef.once('value');
    const data = snapshot.val();

    if (!data) {
      return res.status(404).json({ message: 'No summary data found' });
    }

    let totalGained = 0;
    let totalBurned = 0;

    Object.values(data).forEach(day => {
      totalGained += day.caloriesGained || 0;
      totalBurned += day.caloriesBurned || 0;
    });

    const net = totalGained - totalBurned;

    res.status(200).json({
      uid,
      totalCaloriesGained: totalGained,
      totalCaloriesBurned: totalBurned,
      netCalories: net
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 🔹 Get DAILY Summary
exports.getDailySummary = async (req, res) => {
  const { date } = req.params;
  const { uid } = req.user;

  try {
    const summaryRef = admin.database().ref(`users/${uid}/summary/${date}`);
    const snapshot = await summaryRef.once('value');
    const summary = snapshot.val();

    if (!summary) {
      return res.status(404).json({ message: 'No summary found for this date' });
    }

    // Also fetch cumulative total
    const totalRef = admin.database().ref(`users/${uid}/summaryTotal`);
    const totalSnap = await totalRef.once('value');
    const cumulativeTotal = totalSnap.val() || 0;

    res.status(200).json({
      message: 'Summary updated',
      date,
      ...summary,
      cumulativeTotal
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
