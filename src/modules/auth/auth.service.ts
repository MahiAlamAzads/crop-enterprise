import jwt from "jsonwebtoken";
import * as nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.validation.js";

const SALT_ROUNDS = Number(process.env["BCRYPT_SALT_ROUNDS"] ?? 10);

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function buildTransporter() {
  const host = process.env["SMTP_HOST"];
  const port = Number(process.env["SMTP_PORT"] ?? 587);
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];

  if (!host || !user || !pass) {
    throw new Error("SMTP is not fully configured");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export class AuthService {
  async register(input: RegisterInput) {
    const email = input.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash: await hashPassword(input.password),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  }

  async login(input: LoginInput) {
    const email = input.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordOk = await comparePassword(input.password, user.passwordHash);
    if (!passwordOk) {
      throw new Error("Invalid email or password");
    }

    const secret = process.env["JWT_SECRET"];
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
      },
      secret,
      { expiresIn: "7d" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const email = input.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Prevent user enumeration.
    if (!user) {
      return { message: "If the email exists, a recovery link has been sent." };
    }

    const secret = process.env["JWT_SECRET"];
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const backendUrl = process.env["BACKEND_URL"];
    if (!backendUrl) {
      throw new Error("BACKEND_URL is not configured");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: "password-reset",
      },
      secret,
      { expiresIn: "15m" },
    );

    const recoveryLink = `${backendUrl.replace(/\/$/, "")}/api/auth/reset-password?token=${encodeURIComponent(token)}`;

    const transporter = buildTransporter();
    const from =
      process.env["SMTP_FROM"] ||
      process.env["SMTP_USER"] ||
      "no-reply@example.com";

    await transporter.sendMail({
      from,
      to: user.email,
      subject: "Password recovery link",
      text: `Use this link to reset your password: ${recoveryLink}`,
      html: `<p>Hello ${user.name},</p><p>Click the link below to reset your password:</p><p><a href="${recoveryLink}">${recoveryLink}</a></p><p>This link expires in 15 minutes.</p>`,
    });

    return { message: "If the email exists, a recovery link has been sent." };
  }

  async resetPassword(input: ResetPasswordInput) {
    const secret = process.env["JWT_SECRET"];
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    let decoded: jwt.JwtPayload;
    try {
      const verified = jwt.verify(input.token, secret);
      if (typeof verified === "string") {
        throw new Error("Invalid reset token");
      }
      decoded = verified;
    } catch {
      throw new Error("Invalid or expired reset token");
    }

    const tokenType = decoded["type"];
    const tokenEmail = decoded["email"];

    if (tokenType !== "password-reset" || typeof tokenEmail !== "string") {
      throw new Error("Invalid reset token");
    }

    const user = await prisma.user.findUnique({
      where: { email: tokenEmail.toLowerCase() },
    });
    if (!user) {
      throw new Error("Invalid reset token");
    }

    const newHash = await hashPassword(input.password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return { message: "Password reset successful" };
  }
}
