const express = require("express");
const router = express.Router();


// ---------- Language detection -------

function detectLanguage(text) {

  const hindiPattern = /[\u0900-\u097F]/;

  if (hindiPattern.test(text)) {
    return "Hindi";
  }

  if (text.toLowerCase().includes("ka") ||
      text.toLowerCase().includes("kya") ||
      text.toLowerCase().includes("hai")) {
    return "Hinglish";
  }

  return "English";
}

router.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;
    const language = detectLanguage(message);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
//       body: JSON.stringify({
//         model: "meta-llama/llama-3-8b-instruct",
//         messages: [
//   {
//     role: "system",
//     content: `
// You are a healthcare assistant designed to help ASHA workers in India.

// Rules:
// - Answer in simple language.
// - Prefer Hindi unless user asks English.
// - Provide safe medical guidance only.
// - Suggest visiting a doctor for serious symptoms.
// - Never prescribe dangerous treatments.

// Context:
// You help with:
// - pregnancy monitoring
// - vaccination guidance
// - anemia awareness
// - newborn care
// - maternal health
// `
//   },
//   {
//     role: "user",
//     content: message
//   }
// ]
//       })

body: JSON.stringify({
  model: "meta-llama/llama-3-8b-instruct",
  temperature: 0.3,
  max_tokens: 300,
  messages: [
   {
  role: "system",
  content: `
You are a healthcare assistant helping ASHA workers and rural patients in India.

IMPORTANT:
The user's language is: ${language}

Rules:
- If language = Hindi → reply in Hindi script.
- If language = Hinglish → reply in Hinglish.
- If language = English → reply fully in English.

Keep answers simple for rural healthcare workers.

Focus on:
• Pregnancy care
• Anemia
• Vaccination
• Maternal health
• Newborn care

Always suggest visiting PHC or doctor for serious conditions.
`
},
    {
      role: "user",
      content: message
    }
  ]
})
    });

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content?.trim() || "AI could not generate a response.";
    console.log("OpenRouter RAW:", JSON.stringify(data, null, 2));

    res.json({ reply });

  } catch (error) {

    console.error("AI ERROR:", error);

    res.status(500).json({
      message: "AI response failed"
    });

  }

});

module.exports = router;