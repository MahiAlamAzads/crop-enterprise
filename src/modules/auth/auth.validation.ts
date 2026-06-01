import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "name must be at least 2 characters"),
  email: z.string().email("invalid email format").toLowerCase(),
  password: z.string().min(6, "password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("invalid email format").toLowerCase(),
  password: z.string().min(1, "password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("invalid email format").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "token is required"),
  password: z.string().min(6, "password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export class AuthValidator {
  validateRegister(body: unknown) {
    const parsed = registerSchema.safeParse(body);
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

  validateLogin(body: unknown) {
    const parsed = loginSchema.safeParse(body);
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

  validateForgotPassword(body: unknown) {
    const parsed = forgotPasswordSchema.safeParse(body);
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

  validateResetPassword(body: unknown) {
    const parsed = resetPasswordSchema.safeParse(body);
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
