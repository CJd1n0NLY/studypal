import { useUserStore } from "@/stores/useUserStore";
import axios from "axios";
import { PROMPTS } from "../constants/prompts";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const baseUrl =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const checkOfflineMode = () => {
  const isOffline = useUserStore.getState().offlineMode;
  if (isOffline) {
    throw new Error("OFFLINE_MODE_ACTIVE");
  }
};

export const generateSummary = async (text: string) => {
  checkOfflineMode();
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
  checkOfflineMode();
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

export const generateQuiz = async (topic: string) => {
  checkOfflineMode();
  try {
    const quizPrompt = `
      Create a 5-question multiple choice quiz about: "${topic}".
      Format the response strictly as a JSON object containing a "questions" array.
      Each question must have: "id" (number), "question" (string), "options" (array of exactly 4 strings), "correctAnswer" (string matching one of the options), and "explanation" (short string explaining why it's correct).
      Example: { "questions": [ { "id": 1, "question": "What is 2+2?", "options": ["1", "3", "4", "5"], "correctAnswer": "4", "explanation": "2 plus 2 equals 4." } ] }
    `;

    const baseUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    const response = await axios.post(`${baseUrl}?key=${GEMINI_API_KEY}`, {
      systemInstruction: {
        parts: [
          { text: "You are an expert quiz master. Always return valid JSON." },
        ],
      },
      contents: [{ parts: [{ text: quizPrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    return JSON.parse(response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    throw error;
  }
};

export const generateVoiceExplanation = async (topic: string) => {
  checkOfflineMode();
  try {
    const voicePrompt = `
      Explain the following topic as if you're a friendly, enthusiastic tutor talking to a 16-year-old student. 
      Use simple language, relatable analogies, and occasional humor. Keep it under 150 words. 
      Do NOT use bullet points, asterisks, or bold text — write in natural, conversational paragraphs that are easy to read out loud.
      Format the response strictly as JSON: { "transcript": "the explanation text goes here" }
      Topic: "${topic}"
    `;

    const baseUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    const response = await axios.post(`${baseUrl}?key=${GEMINI_API_KEY}`, {
      systemInstruction: {
        parts: [
          {
            text: "You are an enthusiastic voice actor and tutor. Always return valid JSON.",
          },
        ],
      },
      contents: [{ parts: [{ text: voicePrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    return JSON.parse(response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Gemini Voice Error:", error);
    throw error;
  }
};
