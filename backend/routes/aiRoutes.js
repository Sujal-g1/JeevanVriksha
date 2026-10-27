
const express = require("express");
const router = express.Router();

function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";

  if (/\b(ka|kya|hai|hain|nahi|mera|mujhe|kaise|karo|batao)\b/i.test(text)) {
    return "Hinglish";
  }

  return "English";
}

router.post("/chat", async (req, res) => {
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
    const model =
      process.env.OPENROUTER_MODEL ||
      "nvidia/nemotron-3.5-lightning:free";

    console.log("AI request started:", {
      model,
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
          model,
          temperature: 0.3,
          max_tokens: 1000,

          // A small reasoning budget helps on compatible models.
          reasoning: {
            effort: "low",
          },

          messages: [
          {
  role: "system",
  content: `
You are SEVA-AI, a helpful healthcare assistant for ASHA workers
and rural patients in India.

LANGUAGE:
- Hindi: respond in natural Hindi using Devanagari script.
- Hinglish: respond in natural Hinglish.
- English: respond in English.

RESPONSE RULES:
- Answer the user's actual question directly.
- Never respond with only a greeting when the user asks a question.
- For general questions, explain your capabilities with 3-5 useful examples.
- For health questions, use simple, accurate, safe language.
- Use Markdown headings and bullet points for longer responses.
- Keep answers concise but complete.
- Recommend a PHC or hospital for serious symptoms.
- For emergencies, advise immediate medical assistance.
- Never invent diagnoses or medical facts.
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

    const rawBody = await response.text();

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error("OpenRouter returned invalid JSON:", {
        status: response.status,
        body: rawBody.slice(0, 500),
      });

      return res.status(502).json({
        reply: "The AI service returned an invalid response. Please try again.",
      });
    }

    if (!response.ok || data?.error) {
      console.error("OpenRouter API error:", {
        status: response.status,
        error: data?.error,
      });

      return res.status(502).json({
        reply: "The AI service is temporarily unavailable. Please try again.",
      });
    }

    const choice = data?.choices?.[0];
    const content = choice?.message?.content;

    // Most chat models return a string. Also support text-block arrays.
    const reply =
      typeof content === "string"
        ? content.trim()
        : Array.isArray(content)
          ? content
              .filter((part) => part?.type === "text")
              .map((part) => part.text || "")
              .join("\n")
              .trim()
          : "";

    if (!reply) {
      console.error("OpenRouter returned no visible text:", {
        model: data?.model,
        finishReason: choice?.finish_reason,
        message: choice?.message,
        usage: data?.usage,
      });

      return res.status(502).json({
        reply:
          "I couldn't generate an answer this time. Please try again.",
      });
    }

    console.log("AI response generated:", {
      model: data?.model,
      finishReason: choice?.finish_reason,
      responseLength: reply.length,
      usage: data?.usage,
    });

    return res.json({ reply });
  } catch (error) {
    const timedOut = error.name === "AbortError";

    console.error("AI request failed:", error);

    return res.status(timedOut ? 504 : 502).json({
      reply: timedOut
        ? "The AI took too long to respond. Please try again."
        : "Unable to connect to the AI service. Please try again.",
    });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
