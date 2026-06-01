import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger.js";

function createGeminiClient() {
  const geminiApiKey = process.env["GEMINI_API_KEY"];
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set. GenAI calls will fail.");
  }

  return new GoogleGenAI({ apiKey: geminiApiKey });
}

export async function getRecoveryInstructions(diseaseName: string) {
  // Guard clause: Prevents sending empty/invalid requests to the API
  if (
    !diseaseName ||
    typeof diseaseName !== "string" ||
    diseaseName.trim() === ""
  ) {
    throw new Error("A valid disease name must be provided.");
  }

  const prompt = `Provide in Bangla a concise, practical recovery and treatment plan for the following condition: "${diseaseName.trim()}". 
  Include immediate steps and preventive measures based on reliable medical research. Format it in a few clear paragraphs.`;

  try {
    const ai = createGeminiClient();
    const resp = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    // The official @google/genai SDK provides a reliable `.text` getter.
    // We fall back to a stringified response only if .text is somehow empty.
    if (resp && resp.text) {
      return resp.text;
    }

    logger.warn("Received empty text response from Gemini API", {
      response: resp,
    });
    return JSON.stringify(resp);
  } catch (error) {
    logger.error(
      `Failed to fetch recovery instructions for ${diseaseName}:`,
      error,
    );
    throw error; // Re-throw so the calling function knows it failed
  }
}
