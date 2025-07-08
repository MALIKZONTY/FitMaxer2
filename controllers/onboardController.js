const admin = require('firebase-admin');
const { generateWeeklyPlan } = require('../services/geminiService');



exports.saveUserProfileAndGeneratePlan = async (req, res) => {
  try {
    const { uid } = req.user; // ✅ Extract uid from token (already verified by middleware)

    const data = req.body;
    const userRef = admin.database().ref(`users/${uid}`);

    // Save user profile data
    await userRef.child('profile').set({ ...data, joinedAt: Date.now() });

    // Get 7-day plan from Gemini
    const weeklyText = await generateWeeklyPlan(data);

    console.log("🧠 Gemini Output:\n", weeklyText);

    const weeklyPlan = weeklyText.split(/\*\*Day \d:\*\*/).slice(1);

    for (let i = 0; i < weeklyPlan.length; i++) {
      const day = `Day${i + 1}`;
      const content = weeklyPlan[i].trim();

      const splitIndex = content.indexOf('* **Workout Plan:**');
      let dietText = '';
      let workoutText = '';

      if (splitIndex !== -1) {
        dietText = content.slice(0, splitIndex).trim();
        workoutText = content.slice(splitIndex).replace('* **Workout Plan:**', '').trim();
      } else {
        dietText = content;
      }

      await userRef.child(`plans/dietPlans/${day}`).set({ planText: dietText });
      await userRef.child(`plans/workoutPlans/${day}`).set({ planText: workoutText });
    }

    await userRef.child('plans/rawGeminiOutput').set(weeklyText);

    res.status(200).json({
      message: 'User data saved and 7-day plan stored successfully',
      previewDaysStored: weeklyPlan.length
    });
  } catch (err) {
    console.error('Onboard Error:', err);
    res.status(400).json({ error: err.message });
  }
};

















