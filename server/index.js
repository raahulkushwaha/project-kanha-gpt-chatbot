import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Enable CORS for Vite frontend running on localhost:5173
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

const SYSTEM_PROMPT = `You are Kanha-GPT (Sārathi-AI), a wise and compassionate guide grounded in the Bhagavad Gītā and Mahābhārata. 
Provide practical, empathetic counsel for life dilemmas while referencing ancient wisdom. Use bullet points or concise lists instead of large tables when listing steps, and ensure your response is complete. Finish every list item and paragraph with complete sentences ending in proper terminal punctuation (period, exclamation mark, or question mark). Never leave bullet points, list items, sentences, or ideas dangling or incomplete.`;

function sanitizeResponse(text) {
  if (!text) return text;

  const lines = text.split("\n");

  while (lines.length > 0) {
    const lastLine = lines[lines.length - 1].trim();

    if (lastLine === "") {
      lines.pop();
      continue;
    }

    const isDanglingBullet = /^([-*•]|\d+[.)])\s*$/.test(lastLine);
    const isIncomplete = !/[.!?]$/.test(lastLine);

    if (isDanglingBullet || isIncomplete) {
      lines.pop();
    } else {
      break;
    }
  }

  return lines.join("\n").trim();
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ response: "Message query is required." });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_completion_tokens: 1024,
      reasoning_effort: "low",
      reasoning_format: "hidden"
    });

    const reply = sanitizeResponse(
      completion.choices[0]?.message?.content ||
        "No response generated from Sārathi.",
    );

    res.json({
      response: reply,
      citation: "Bhagavad Gītā",
      purushartha: "Dharma",
    });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({
      response:
        "Unable to connect to the Sārathi AI engine. Please check your backend server and API key.",
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Sārathi Node.js Backend running on http://127.0.0.1:${PORT}`);
});
