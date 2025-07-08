const admin = require('firebase-admin');

//const jwt = require('jsonwebtoken');






exports.generateRoutinePlan = async (req, res) => {
  try {
    
    const { uid } = req.user;
    const userRef = admin.database().ref(`users/${uid}`);

    // Fetch profile to get duration
    const profileSnap = await userRef.child('profile').once('value');
    const profile = profileSnap.val();
    const duration = profile ? parseInt(profile.duration, 10) : null;

    if (!duration) {
      return res.status(400).json({ error: 'Onboarding not complete. Duration not found in user profile.' });
    }

    const dietPlansRef = userRef.child('plans/dietPlans');
    const workoutPlansRef = userRef.child('plans/workoutPlans');

    const [dietPlansSnap, workoutPlansSnap] = await Promise.all([
      dietPlansRef.once('value'),
      workoutPlansRef.once('value')
    ]);

    const dietPlans = dietPlansSnap.val();
    const workoutPlans = workoutPlansSnap.val();

    if (!dietPlans || !workoutPlans) {
      return res.status(400).json({ error: 'Base 7-day plans not found. Please generate them first.' });
    }

    const routineDietRef = userRef.child('routineDiet');
    const routineWorkoutRef = userRef.child('routineWorkout');

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

















    const extractMealsFromText = (text) => {
  const lines = text.split('\n');
  const meals = [];

  const mealNames = ['Breakfast', 'Lunch', 'Dinner'];

  for (const line of lines) {
    for (const meal of mealNames) {
      if (line.includes(`**${meal} (~`)) {
        const kcalStart = line.indexOf('(~') + 2;
        const kcalEnd = line.indexOf('kcal');
        const calories = parseInt(line.slice(kcalStart, kcalEnd).trim());

        const foodStart = line.indexOf('):') + 2;
        const food = line.slice(foodStart).trim().replace(/\.$/, ''); // Remove trailing dot

        meals.push({
          meal,
          food,
          calories,
          isDone: false
        });
      }
    }
  }

  // Fill missing meals if any
  for (const meal of mealNames) {
    if (!meals.find(m => m.meal === meal)) {
      meals.push({
        meal,
        food: '',
        calories: 0,
        isDone: false
      });
    }
  }

  return meals;
};

















    for (let day = 1; day <= duration; day++) {
      const baseDay = `Day${((day - 1) % 7) + 1}`;
      const dietPlan = dietPlans[baseDay];
      const workoutPlan = workoutPlans[baseDay];

      const planDate = new Date(startDate);
      planDate.setDate(startDate.getDate() + (day - 1));
      const formattedDate = formatDate(planDate);

      const oneDayBefore = new Date(today);
      oneDayBefore.setDate(today.getDate() - 1);

      const isActive = formattedDate === formatDate(today) || formattedDate === formatDate(oneDayBefore);

      /** ---------------- DIET PLAN ---------------- */
      if (dietPlan && typeof dietPlan.planText === 'string') {
        const meals = extractMealsFromText(dietPlan.planText);
         //console.log(meals)
        const structuredDiet = {
          day: `day${day}`,
          date: formattedDate,
          status: isActive,
          meals,
          today_diet_completed: false
        };

        await routineDietRef.child(`Day${day}`).set(structuredDiet);
      }

      /** ---------------- WORKOUT PLAN ---------------- */
      if (workoutPlan && typeof workoutPlan.planText === 'string') {
        const planText = workoutPlan.planText.replace(/\*\*Important Note:[\s\S]*/gi, '').trim();

        const cardioMatch = planText.match(/\*\*Cardio:\*\*(.*?)\*/s);
        const cardio = cardioMatch ? cardioMatch[1].trim().replace(/\n/g, ' ') : '';

        const strengthMatch = planText.match(/\*\*Strength Training:\*\*([\s\S]*)/);
        let strengthText = strengthMatch ? strengthMatch[1] : '';
        strengthText = strengthText.replace(/\*\*.*$/s, '').trim();

        const strengthExercises = {};
        const exerciseLines = strengthText.match(/\*\s*(.+?):\s*(.+)/g);
        if (exerciseLines) {
          exerciseLines.forEach(line => {
            const match = line.match(/\*\s*(.+?):\s*(.+)/);
            if (match) {
              const key = match[1].trim().replace(/\s+/g, '');
              const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
              strengthExercises[camelKey] = match[2].trim();
            }
          });
        }

        const structuredWorkout = {
          day: `day${day}`,
          date: formattedDate,
          status: isActive,
          cardio,
          isDone_cardio: false,
          strengthTraining: strengthExercises,
          isDone_strengthTraining: false,
          today_workout_completed: false
        };

        await routineWorkoutRef.child(`Day${day}`).set(structuredWorkout);
      }
    }

    res.status(200).json({
      message: '✅ routineDiet and routineWorkout created in structured format.',
      isRedirect : true
    });

  } catch (error) {
    console.error('Error generating routine plan:', error);
    res.status(500).json({ error: 'Failed to generate routine plan', details: error.message });
  }
};



exports.getAllRoutinePlans = async (req, res) => {
  try {
    const { uid } = req.user;

    const profileSnap = await admin.database().ref(`users/${uid}/profile`).once('value');
    const profile = profileSnap.val();
    // Default to 0 if duration is not set, resulting in an empty routine
    const duration = profile && profile.duration ? parseInt(profile.duration, 10) : 0;

    if (duration === 0) {
      return res.status(200).json({ routine: [] });
    }

    const dietRef = admin.database().ref(`users/${uid}/routineDiet`);
    const workoutRef = admin.database().ref(`users/${uid}/routineWorkout`);

    const [dietSnap, workoutSnap] = await Promise.all([
      dietRef.once('value'),
      workoutRef.once('value')
    ]);

    const dietData = dietSnap.val() || {};
    const workoutData = workoutSnap.val() || {};

    const response = [];

    for (let i = 1; i <= duration; i++) {
      const dayKey = `Day${i}`;
      const normalizedDay = i.toString();

      const diet = dietData[dayKey] || null;
      const workout = workoutData[dayKey] || null;

      // Optional: override internal 'day' property inside diet/workout if it exists
      if (diet) diet.day = normalizedDay;
      if (workout) workout.day = normalizedDay;

      response.push({
        day: normalizedDay,
        diet,
        workout
      });
    }

    res.status(200).json({ routine: response });
  } catch (err) {
    console.error('Error fetching all routine plans:', err);
    res.status(500).json({ error: 'Failed to fetch all routines', details: err.message });
  }
};



exports.getRoutineByDate = async (req, res) => {
  try {
    const { uid } = req.user;

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;

    const dietRef = admin.database().ref(`users/${uid}/routineDiet`);
    const workoutRef = admin.database().ref(`users/${uid}/routineWorkout`);

    const [dietSnap, workoutSnap] = await Promise.all([
      dietRef.once('value'),
      workoutRef.once('value')
    ]);

    const dietData = dietSnap.val() || {};
    const workoutData = workoutSnap.val() || {};

    let dietForDate = null;
    let workoutForDate = null;

    for (const key in dietData) {
      if (dietData[key].date === date) {
        dietForDate = { ...dietData[key] };
        break;
      }
    }

    for (const key in workoutData) {
      if (workoutData[key].date === date) {
        workoutForDate = { ...workoutData[key] };
        break;
      }
    }

    // 🛠️ Normalize "day" to number format (e.g., "8" instead of "day8")
    const normalizeDay = (entry) => {
      if (entry && typeof entry.day === 'string') {
        const match = entry.day.match(/\d+/); // extract number from string
        if (match) entry.day = match[0]; // set to just the number
      }
    };

    normalizeDay(dietForDate);
    normalizeDay(workoutForDate);

    if (!dietForDate && !workoutForDate) {
      return res.status(404).json({ error: `No routine found for date ${date}` });
    }

    return res.status(200).json({
      date,
      diet: dietForDate,
      workout: workoutForDate
    });

  } catch (err) {
    console.error('Error fetching routine by date:', err);
    res.status(500).json({ error: 'Failed to fetch routine by date', details: err.message });
  }
};
