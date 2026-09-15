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
Provide practical, empathetic counsel for life dilemmas while referencing ancient wisdom. Keep responses concise, clear, and relevant.`;

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
      max_tokens: 500,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "No response generated from Sārathi.";

    res.json({
      response: reply,
      citation: "Bhagavad Gītā 2.47",
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
