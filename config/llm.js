// config/llm.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();

export const callLLM = async (messages, options = {}) => {
  try {
    if (PROVIDER === "gemini") {
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: options.model || "gemini-2.5-pro",
      });

      // Gemini requires "contents" with role and parts
      const contents = messages.map((m) => ({
        role: m.role === "system" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const result = await model.generateContent({ contents });
      return result.response.text(); // This gives the final text output
    }

    // OpenAI fallback
    if (PROVIDER === "openai") {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error("OPENAI_API_KEY not set");

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: options.model || "gpt-4o-mini",
          messages,
          max_tokens: options.max_tokens || 800,
          temperature: options.temperature ?? 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content;
    }

    return "MOCK: Neutral (no LLM provider configured).";
  } catch (err) {
    throw err;
  }
};
