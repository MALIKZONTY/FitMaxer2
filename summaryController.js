const admin = require('firebase-admin');

exports.updateDailySummary = async (req, res) => {
  const { uid, date } = req.params;
  const { caloriesGained, caloriesBurned } = req.body;

  const net = caloriesGained - caloriesBurned;

  const summaryRef = admin.database().ref(`users/${uid}/summary`);
  await summaryRef.child(date).set({ caloriesGained, caloriesBurned, net });

  const totalRef = admin.database().ref(`users/${uid}/summaryTotal`);
  const snapshot = await totalRef.once('value');
  const prev = snapshot.val() || 0;
  await totalRef.set(prev + net);

  res.status(200).json({ message: 'Summary updated', net });
};


exports.getCumulativeSummary = async (req, res) => {
  const { uid } = req.params;

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