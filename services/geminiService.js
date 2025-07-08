const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateWeeklyPlan = async (user) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Generate a one-week personalized diet and workout plan for a user with the following details:
Age: ${user.age}
Gender: ${user.gender}
Weight: ${user.weight}kg
Height: ${user.height}cm
Activity Level: ${user.activityLevel}
Fitness Goal: ${user.fitnessGoal}
Duration: ${user.duration} days
Diet Preference: ${user.dietPreference}
Physical Illness: ${user.illnessStatus === 'Yes' ? user.illnessType : 'None'}
Target Weight ${user.fitnessGoal === 'Weight Loss' ? 'Loss' : 'Gain'}: ${user.weightTarget}kg

Instructions:
- Provide a unique and complete Diet Plan and Workout Plan for each of the 7 days.
- **Do not repeat** any day’s content.
- **Do not use phrases** like “Repeat Day 1”, “Same as previous day”, or “Refer to earlier plan”.
- Ensure each **Workout Plan** includes both cardio and strength training.
- Format the workout exercises with clear names, sets, and reps.
- Format each meal with specific items and quantities.
- Mention approximate calories for **Breakfast**, **Lunch**, and **Dinner**.

Output format:
**Day 1:**
* **Diet Plan:**
  * **Breakfast (~350 kcal):** ...
  * **Morning Snack:** ...
  * **Lunch (~450 kcal):** ...
  * **Evening Snack:** ...
  * **Dinner (~750 kcal):** ...
* **Workout Plan:**
  * **Cardio:** ...
  * **Strength Training:**
    * Exercise 1: ...
    * Exercise 2: ...
    * ...

**Day 2:**
...
(Continue till **Day 7**)
`;



  const result = await model.generateContent(prompt);
  console.log(result)
  return result.response.text();
};
