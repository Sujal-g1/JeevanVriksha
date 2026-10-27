
const express = require("express");
const router = express.Router();

function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) {
    return "Hindi";
  }

  if (/\b(ka|kya|hai|hain|nahi|mera|mujhe|kaise|karo|batao)\b/i.test(text)) {
    return "Hinglish";
  }
  return "English";
}

router.post("/chat", async (req, res) => {
  console.log("✅ /api/ai/chat route reached");
  const { message } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      reply: "Please enter a message.",
    });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is missing");

    return res.status(500).json({
      reply: "AI service is not configured. Please contact support.",
    });
  }

  const language = detectLanguage(message);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    console.log("AI request started:", {
      language,
      messageLength: message.length,
    });

  
const response = await fetch(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model:
        process.env.OPENROUTER_MODEL ||
        "openrouter/free",
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: `
You are SEVA-AI, a healthcare assistant helping ASHA workers
and rural patients in India.

The user's language is ${language}.

- Hindi: reply in Hindi script.
- Hinglish: reply in natural Hinglish.
- English: reply in English.
- Use simple language.
- Provide safe general healthcare information.
- Recommend a PHC or hospital for serious symptoms.
- For emergencies, recommend immediate medical assistance.
          `.trim(),
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],
    }),
  }
);


    const data = await response.json();

    // Log the actual upstream error instead of hiding it.
    if (!response.ok) {
      console.error("OpenRouter API error:", {
        status: response.status,
        error: data?.error,
      });

      return res.status(502).json({
        reply:
          response.status === 401
            ? "AI authentication failed. Please contact support."
            : response.status === 402
            ? "AI service credits are insufficient. Please try again later."
            : response.status === 429
            ? "The AI service is busy. Please try again shortly."
            : "The AI service is temporarily unavailable. Please try again.",
      });
    }

    if (data?.error) {
      console.error("OpenRouter generation error:", data.error);

      return res.status(502).json({
        reply: "The AI could not generate a response. Please try again.",
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      console.error("OpenRouter returned no text:", {
        model: data?.model,
        choices: data?.choices,
        usage: data?.usage,
      });

      return res.status(502).json({
        reply: "The AI returned an empty response. Please try again.",
      });
    }

    console.log("AI response generated successfully:", {
      model: data.model,
      responseLength: reply.length,
    });

    return res.json({ reply: reply.trim() });
  } catch (error) {
    const timedOut = error.name === "AbortError";

    console.error(
      timedOut ? "OpenRouter request timed out" : "AI request failed:",
      error
    );

    return res.status(timedOut ? 504 : 500).json({
      reply: timedOut
        ? "The AI took too long to respond. Please try again."
        : "Unable to connect to the AI service. Please try again.",
    });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
