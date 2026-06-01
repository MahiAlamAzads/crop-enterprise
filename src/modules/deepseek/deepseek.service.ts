import type { RecoveryInstructionsInput } from "./deepseek.validation.js";

export class DeepSeekService {
  async getRecoveryInstructions(input: RecoveryInstructionsInput) {
    const apiKey = process.env["DEEPSEEK_API_KEY"];
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not set. DeepSeek calls will fail.");
    }

    const diseaseName = input.diseaseName.trim();
    const prompt = `Provide in Bangla a concise, practical recovery and treatment plan for the following condition: "${diseaseName}". Include immediate steps and preventive measures based on reliable medical research. Format it in a few clear paragraphs.`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env["DEEPSEEK_MODEL"] ?? "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(
        `DeepSeek API error: ${response.status} ${JSON.stringify(json)}`,
      );
    }

    const content = json?.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return content;
    }

    return JSON.stringify(json);
  }
}
