import { z } from "zod";

export const recoveryInstructionsSchema = z.object({
  diseaseName: z.string().min(1, "diseaseName is required"),
});

export type RecoveryInstructionsInput = z.infer<
  typeof recoveryInstructionsSchema
>;

export class GeminiValidator {
  validateRecoveryInstructions(body: unknown) {
    const parsed = recoveryInstructionsSchema.safeParse(body);
    if (!parsed.success) {
      return {
        valid: false as const,
        errors: parsed.error.errors.map(
          (e) => `${e.path.join(".") || "body"}: ${e.message}`,
        ),
      };
    }

    return { valid: true as const, payload: parsed.data };
  }
}
