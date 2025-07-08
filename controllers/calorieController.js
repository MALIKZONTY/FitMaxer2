/* exports.calculateCalories = (req, res) => {
  const { foodItem, grams } = req.body;

  const calories = Math.floor(grams * 0.8); // Simulated
  const macros = {
    carbs: grams * 0.1,
    proteins: grams * 0.05,
    fats: grams * 0.02
  };

  res.json({ foodItem, grams, calories, macros });
};

*/

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Joi = require('joi');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getCalorieInfo = async (req, res) => {
  try {
    const { foodInput } = req.body;

    // Input validation
    const schema = Joi.object({
      foodInput: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Prompt to force structured format
    const prompt = `
For the following food item: "${foodInput}", provide only the nutritional values in this exact JSON format:

{
  "calories": "",
  "carbs": "",
  "proteins": "",
  "fats": "",
  "vitamins": "",
}

For vitamins, give me what vitamins are present and how much amount and give this vitamins in object format.

Only return valid numbers with units if known (e.g., "120 kcal", "12 g").
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  //const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const aiResponse = await model.generateContent(prompt);
    const responseText = aiResponse.response.text();

    // Try parsing the JSON part
    const match = responseText.match(/\{[\s\S]*\}/); // Match JSON block
    if (!match) {
      return res.status(500).json({ error: "AI response could not be parsed" });
    }

    const nutrition = JSON.parse(match[0]);

    res.json(nutrition);

  } catch (err) {
    console.error("Error in getCalorieInfo:", err);
    res.status(500).json({ error: "Failed to process chatbot request", details: err.message });
  }
};
