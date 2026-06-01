import type { Request, Response } from "express";
import { config } from "../../config.js";
import { HttpClient } from "../../lib/httpClient.js";
import { GeminiValidator } from "./gemini.validation.js";
import { GeminiService } from "./gemini.service.js";

export class GeminiController {
  private validator = new GeminiValidator();
  private service = new GeminiService(new HttpClient(), config);

  recoveryInstructions = async (req: Request, res: Response) => {
    const validation = this.validator.validateRecoveryInstructions(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const recovery = await this.service.getRecoveryInstructions(
        validation.payload,
      );
      return res.json({ recovery });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  };
}

const controller = new GeminiController();
export const recoveryInstructions =
  controller.recoveryInstructions.bind(controller);
