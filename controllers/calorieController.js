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
require('dotenv').config();

const { OpenAI } = require("openai");
const Joi = require('joi');

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    // Prompt for structured output
    const prompt = `
For the following food item: "${foodInput}", provide only the nutritional values in this exact JSON format:

{
  "calories": "",
  "carbs": "",
  "proteins": "",
  "fats": "",
  "vitamins": {}
}

Only return valid numbers with units (e.g., "120 kcal", "12 g", "2 mg"). For vitamins, return them as key-value pairs with their quantities.
`;

    // Use OpenAI to get the structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4o"
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content;

    // Try extracting JSON from the response
    const match = responseText.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: "AI response could not be parsed" });
    }

    const nutrition = JSON.parse(match[0]);

    res.json(nutrition);

  } catch (err) {
    console.error("Error in getCalorieInfo:", err);
    res.status(500).json({ error: "Failed to process AI request", details: err.message });
  }
};
