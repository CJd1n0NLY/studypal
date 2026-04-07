export const extractTextFromImage = async (
  base64Image: string,
): Promise<string> => {
  const VISION_API_KEY = process.env.EXPO_PUBLIC_VISION_API_KEY;

  // DEV FALLBACK: If no API key is provided, simulate reading text
  if (!VISION_API_KEY) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          "This is simulated text extracted from your camera! To read real textbooks, add a Google Cloud Vision API key to your .env file. \n\nPhotosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy.",
        );
      }, 2000); // 2 second fake processing time
    });
  }

  // REAL PRODUCTION CALL: Google Cloud Vision
  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: "DOCUMENT_TEXT_DETECTION" }], // Optimized for handwriting and dense text
            },
          ],
        }),
      },
    );

    const result = await response.json();
    if (result.responses && result.responses[0].fullTextAnnotation) {
      return result.responses[0].fullTextAnnotation.text;
    } else {
      return "No readable text found in this image.";
    }
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text");
  }
};
