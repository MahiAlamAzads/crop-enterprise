import { z } from "zod";

export const nearestAgroSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const nearestAgroQuerySchema = z.object({
  lat: z.union([z.string(), z.number()]),
  lng: z.union([z.string(), z.number()]),
});

export type NearestAgroInput = z.infer<typeof nearestAgroSchema>;
export type NearestAgroQueryInput = z.infer<typeof nearestAgroQuerySchema>;

export class GooglePlacesValidator {
  validateNearestAgro(body: unknown) {
    const parsed = nearestAgroSchema.safeParse(body);
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

  validateNearestAgroQuery(query: unknown) {
    const parsed = nearestAgroQuerySchema.safeParse(query);
    if (!parsed.success) {
      return {
        valid: false as const,
        errors: parsed.error.errors.map(
          (e) => `${e.path.join(".") || "query"}: ${e.message}`,
        ),
      };
    }

    return { valid: true as const, payload: parsed.data };
  }
}
