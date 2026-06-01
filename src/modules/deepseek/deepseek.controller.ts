import type { Request, Response } from "express";
import { DeepSeekValidator } from "./deepseek.validation.js";
import { DeepSeekService } from "./deepseek.service.js";

export class DeepSeekController {
  private validator = new DeepSeekValidator();
  private service = new DeepSeekService();

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

const controller = new DeepSeekController();
export const recoveryInstructions =
  controller.recoveryInstructions.bind(controller);
