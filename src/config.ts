import { z } from "zod";

const EnvSchema = z.object({
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  BACKEND_URL: z.string().url().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_MODEL: z.string().optional(),
  PORT: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.warn("Environment validation failed:", parsed.error.format());
}

export const config = {
  GOOGLE_API_KEY:
    process.env["GOOGLE_API_KEY"] ??
    process.env["GOOGLE_MAPS_API_KEY"] ??
    undefined,
  GOOGLE_MAPS_API_KEY: process.env["GOOGLE_MAPS_API_KEY"] ?? undefined,
  PORT: Number(process.env["PORT"] ?? 3000),
  BACKEND_URL:
    process.env["BACKEND_URL"] ??
    `http://localhost:${process.env["PORT"] ?? 3000}`,
  DEEPSEEK_API_KEY: process.env["DEEPSEEK_API_KEY"] ?? undefined,
  DEEPSEEK_MODEL: process.env["DEEPSEEK_MODEL"] ?? "deepseek-v4-flash",
};

export type Config = typeof config;
