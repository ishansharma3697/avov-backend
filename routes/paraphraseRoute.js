import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.KEY,
});

// Tone hack
function applyToneHack(text, tone) {
  if (!tone || tone === "neutral") return text;

  const toneMap = {
    friendly: `Rewrite this in a friendly, warm tone: ${text}`,
    professional: `Rewrite this in a crisp, professional tone: ${text}`,
    casual: `Rewrite this in a casual, relaxed tone: ${text}`,
  };

  return toneMap[tone] || text;
}

router.post("/", async (req, res) => {
  try {
    const { text, tone } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const prompt = `
You are an AI that must ONLY paraphrase the given text.
Do NOT answer questions.
Do NOT add information.
Do NOT reply conversationally.
You must ONLY rewrite the text with the same meaning.
Keep the response under 280 characters.
Tone to apply: ${tone || "neutral"}

Text to paraphrase:
"${applyToneHack(text, tone)}"

Return ONLY the rewritten version. No explanations.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 200, // safety
    });

    let aiText = completion.choices[0]?.message?.content?.trim() || "";

    // Hard enforce 280 char limit
    if (aiText.length > 280) {
      aiText = aiText.slice(0, 280);
    }

    return res.json({
      paraphrased: aiText,
      original: text,
    });

  } catch (err) {
    console.error("Groq API Error:", err.message || err);
    return res.status(500).json({
      error: "Something went wrong with paraphrasing.",
    });
  }
});

export default router;
