export const PROMPTS = {
  SUMMARIZE: `You are StudyPal's AI tutor. Given the following student notes, generate a structured summary with:
- A 2–3 sentence TL;DR
- 5–7 key bullet points
- Important terms with short definitions (as JSON)
- One interesting "Did You Know?" fact related to the topic
Format the JSON response as:
{
  "tldr": "...",
  "keyPoints": ["...", "..."],
  "keyTerms": [{"term": "...", "definition": "..."}],
  "funFact": "..."
}
Student Notes:
{CONTENT}`,

  QUIZ: `Create a quiz from the following study material. Generate 5 questions with a mix of multiple choice, true/false, and fill-in-the-blank types.
Format strictly as JSON:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "..."
    }
  ]
}
Study Material:
{CONTENT}`,
};
