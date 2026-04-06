import axios from "axios";
import { PROMPTS } from "../constants/prompts";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const baseUrl =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const generateSummary = async (text: string) => {
  try {
    const response = await axios.post(`${baseUrl}?key=${GEMINI_API_KEY}`, {
      systemInstruction: {
        parts: [
          {
            text: "You are a helpful AI tutor. You must ALWAYS return your answer strictly in valid JSON format.",
          },
        ],
      },
      contents: [
        { parts: [{ text: PROMPTS.SUMMARIZE.replace("{CONTENT}", text) }] },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateFlashcards = async (topic: string) => {
  try {
    const flashcardPrompt = `
      Create exactly 5 study flashcards about the following topic: "${topic}".
      Format the response strictly as a JSON array containing objects with 'front' and 'back' properties.
      Example: [{"front": "What is the capital of France?", "back": "Paris"}]
    `;

    const response = await axios.post(`${baseUrl}?key=${GEMINI_API_KEY}`, {
      systemInstruction: {
        parts: [
          {
            text: "You are an expert flashcard creator. Always return a valid JSON array.",
          },
        ],
      },
      contents: [{ parts: [{ text: flashcardPrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    return JSON.parse(response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Gemini Flashcard Error:", error);
    throw error;
  }
};
