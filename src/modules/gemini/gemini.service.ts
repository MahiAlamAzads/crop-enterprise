import { GoogleGenAI } from "@google/genai";
import type { Config } from "../../config.js";
import { HttpClient } from "../../lib/httpClient.js";
import { logger } from "../../lib/logger.js";
import type { RecoveryInstructionsInput } from "./gemini.validation.js";

function createGeminiClient() {
  const geminiApiKey = process.env["GEMINI_API_KEY"];
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set. GenAI calls will fail.");
  }

  return new GoogleGenAI({ apiKey: geminiApiKey });
}

export class GeminiService {
  constructor(
    private http: HttpClient,
    private cfg: Config,
  ) {}

  async getRecoveryInstructions(input: RecoveryInstructionsInput) {
    const diseaseName = input.diseaseName.trim();
    const prompt = `Provide in Bangla a concise, practical recovery and treatment plan for the following condition: "${diseaseName}". 
  Include immediate steps and preventive measures based on reliable medical research. Format it in a few clear paragraphs.`;

    try {
      const ai = createGeminiClient();
      const resp = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      if (resp && resp.text) {
        return resp.text;
      }

      logger.warn("Received empty text response from Gemini API", {
        response: resp,
      });
      return JSON.stringify(resp);
    } catch (error) {
      if (shouldFallbackToDeepSeek(error)) {
        logger.warn(
          "Gemini quota or credit limit reached, falling back to DeepSeek",
          {
            error,
          },
        );

        const backendUrl = this.cfg.BACKEND_URL.replace(/\/$/, "");
        const fallbackResp = await this.http.postJson(
          `${backendUrl}/api/deepseek/recovery-instructions`,
          { diseaseName },
        );

        if (fallbackResp.ok) {
          return fallbackResp.body?.recovery ?? fallbackResp.body;
        }

        throw new Error(
          `DeepSeek fallback failed: ${fallbackResp.status} ${JSON.stringify(fallbackResp.body)}`,
        );
      }

      logger.error(
        `Failed to fetch recovery instructions for ${diseaseName}:`,
        error,
      );
      throw error;
    }
  }
}

function shouldFallbackToDeepSeek(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    message?: unknown;
    status?: unknown;
    code?: unknown;
    response?: { status?: unknown; data?: unknown };
  };

  const status =
    typeof candidate.status === "number"
      ? candidate.status
      : typeof candidate.response?.status === "number"
        ? candidate.response.status
        : undefined;

  // Collect textual clues from message/code/response.data (handles stringified JSON)
  let collectedText = "";
  if (typeof candidate.message === "string")
    collectedText += candidate.message + " ";
  if (typeof candidate.code === "string" || typeof candidate.code === "number")
    collectedText += String(candidate.code) + " ";

  const respData = candidate.response?.data;
  if (typeof respData === "string") {
    collectedText += respData + " ";
    try {
      const parsed = JSON.parse(respData);
      if (parsed) {
        collectedText += JSON.stringify(parsed) + " ";
        if (parsed.error) {
          if (parsed.error.code)
            collectedText += String(parsed.error.code) + " ";
          if (parsed.error.status)
            collectedText += String(parsed.error.status) + " ";
          if (parsed.error.message)
            collectedText += String(parsed.error.message) + " ";
        }
      }
    } catch {
      /* ignore */
    }
  } else if (typeof respData === "object" && respData != null) {
    try {
      collectedText += JSON.stringify(respData) + " ";
      const anyResp: any = respData;
      if (anyResp.error) {
        if (anyResp.error.code)
          collectedText += String(anyResp.error.code) + " ";
        if (anyResp.error.status)
          collectedText += String(anyResp.error.status) + " ";
        if (anyResp.error.message)
          collectedText += String(anyResp.error.message) + " ";
      }
    } catch {
      /* ignore */
    }
  }

  const messageParts = collectedText.toLowerCase();

  // Fall back on common HTTP/status signals and textual hints (including 503)
  return (
    status === 402 ||
    status === 403 ||
    status === 429 ||
    status === 503 ||
    messageParts.includes("quota") ||
    messageParts.includes("credit") ||
    messageParts.includes("insufficient") ||
    messageParts.includes("billing") ||
    messageParts.includes("not set") ||
    messageParts.includes("api key") ||
    messageParts.includes("unavailable") ||
    messageParts.includes("high demand") ||
    messageParts.includes("service unavailable") ||
    messageParts.includes("tempor")
  );
}
