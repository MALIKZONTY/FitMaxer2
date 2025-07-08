const admin = require('firebase-admin');

exports.logMealStatus = async (req, res) => {
  const { date } = req.params;
  const { uid } = req.user;
  const { meal, status, customItems } = req.body;

  const ref = admin.database().ref(`users/${uid}/dietTracking/${date}/${meal}`);
  await ref.set({ status, customItems: customItems || null });

  res.status(200).json({ message: 'Diet status recorded' });
};





exports.getDietSummary = async (req, res) => {
  const { date } = req.params;
  const { uid } = req.user;
  const meals = ['Breakfast', 'Lunch', 'Dinner'];

  try {
    let totalCalories = 0;

    for (const meal of meals) {
      const snap = await admin.database().ref(`users/${uid}/dietTracking/${date}/${meal}`).once('value');
      const data = snap.val();

      if (!data) continue;

      if (data.status === 'Completed') {
        // Assume estimated value per meal, or fetch from dietPlan if needed
        totalCalories += 300; // ← you can customize this
      }

      if (data.status === 'Custom' && Array.isArray(data.customItems)) {
        const mealCalories = data.customItems.reduce((sum, item) => sum + (item.calories || 0), 0);
        totalCalories += mealCalories;
      }
    }

    res.status(200).json({ uid, date, totalCaloriesGained: totalCalories });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
