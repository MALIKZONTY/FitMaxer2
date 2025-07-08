const admin = require('firebase-admin');

exports.getSinglePlan = async (req, res) => {
  try {
    const { uid, planType, day } = req.params;

    // Validate type
    if (!['dietPlans', 'workoutPlans'].includes(planType)) {
      return res.status(400).json({ error: "Invalid planType. Must be 'dietPlans' or 'workoutPlans'" });
    }

    const ref = admin.database().ref(`users/${uid}/plans/${planType}/${day}`);
    const snapshot = await ref.once('value');
    const data = snapshot.val();

    if (!data) {
      return res.status(404).json({ message: `No data found for ${planType}/${day}` });
    }

    res.status(200).json({
      uid,
      planType,
      day,
      planText: data.planText
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
