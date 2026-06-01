import { z } from "zod";

export const IdentifySchema = z.object({
  images: z.array(z.string()).nonempty({
    message: "images must be a non-empty array of base64 strings",
  }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  similar_images: z.boolean().optional(),
});

export type IdentifyPayload = z.infer<typeof IdentifySchema>;

export class IdentifyValidator {
  validate(body: any): {
    valid: boolean;
    errors?: string[];
    payload?: IdentifyPayload;
  } {
    const parsed = IdentifySchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => {
        const path = e.path.length ? e.path.join(".") : "body";
        return `${path}: ${e.message}`;
      });
      return { valid: false, errors };
    }

    return { valid: true, payload: parsed.data };
  }
}
