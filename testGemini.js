const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      "Say hello from Gemini! Respond as a cheerful AI assistant."
    ]);

    const text = result.response.text();
    console.log("✅ Gemini says:", text);



    const prompt = `
Generate a one-week personalized diet and workout plan for a user with the following details:
Age: 25, Gender: Male,
Weight: 60, Height: 198cm,
Activity Level: Lightly Active,
Fitness Goal: Weight Gain,
Duration: 90 days,
Diet Preference: Veg,
Physical Illness: None,
Target Weight Gain: 4 kg

Output format:
For each of 7 days, give:
- Diet Plan (Breakfast, Morning Snack, Lunch, Evening Snack, Dinner)
- Workout Plan (exercise name, sets, reps)
Please format each day header like this: **Day 1:**
`

    console.log("📤 Prompt sent to Gemini:\n", prompt);

    const result2 = await model.generateContent([prompt]);
    const text2 = result2.response.text();

    console.log("📥 Gemini response:\n");
    console.log(text2);
  } catch (error) {
    console.error("❌ Gemini error:", error.message);
  }
}

testGemini();



//"Generate a one-week personalized diet and workout plan for a user with the following details:Age: 25, Gender: male,Weight: 60,Height: 198cm,Activity Level: lightly ActiveXObject,Fitness Goal: Weight gain,Duration: 30 days, Diet Preference: Veg, Physical Illness: None, Target Weight Gain : 2 kg \n
//Output format:\n
  //  For each of 7 days, give:\n
    //- Diet Plan (Breakfast, Morning Snack, Lunch, Evening Snack, Dinner)\n
    //- Workout Plan (exercise name, sets, reps)"