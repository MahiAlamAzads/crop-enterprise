import type { Request, Response } from "express";
import { AuthValidator } from "./auth.validation.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
  private validator = new AuthValidator();
  private service = new AuthService();

  register = async (req: Request, res: Response) => {
    const validation = this.validator.validateRegister(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const user = await this.service.register(validation.payload);
      return res
        .status(201)
        .json({ message: "User registered successfully", user });
    } catch (error) {
      return res.status(409).json({ error: (error as Error).message });
    }
  };

  login = async (req: Request, res: Response) => {
    const validation = this.validator.validateLogin(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const result = await this.service.login(validation.payload);
      return res.json(result);
    } catch (error) {
      const message = (error as Error).message;
      if (message === "JWT_SECRET is not configured") {
        return res.status(500).json({ error: message });
      }
      return res.status(401).json({ error: message });
    }
  };

  loginPage = async (_req: Request, res: Response) => {
    return res.status(200).type("html").send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Login</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: #f4f7fb;
            }
            .card {
              width: min(420px, calc(100vw - 32px));
              background: white;
              border-radius: 16px;
              padding: 28px;
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
            }
            h1 { margin: 0 0 16px; font-size: 28px; }
            label { display: block; margin: 14px 0 6px; font-weight: 600; }
            input {
              width: 100%;
              box-sizing: border-box;
              padding: 12px 14px;
              border: 1px solid #cbd5e1;
              border-radius: 10px;
              font-size: 16px;
            }
            button {
              width: 100%;
              margin-top: 18px;
              padding: 12px 14px;
              border: 0;
              border-radius: 10px;
              background: #0f766e;
              color: white;
              font-size: 16px;
              font-weight: 700;
              cursor: pointer;
            }
            .hint { margin-top: 14px; color: #475569; font-size: 14px; }
          </style>
        </head>
        <body>
          <main class="card">
            <h1>Login</h1>
            <form method="post" action="/api/auth/login">
              <label for="email">Email</label>
              <input id="email" name="email" type="email" autocomplete="email" required />

              <label for="password">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required />

              <button type="submit">Sign in</button>
            </form>
            <p class="hint">This form posts to the existing JSON login endpoint.</p>
          </main>
        </body>
      </html>
    `);
  };

  registerPage = async (_req: Request, res: Response) => {
    return res.status(200).type("html").send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Register</title>
          <style>
            body { font-family: Arial, sans-serif; margin:0; min-height:100vh; display:grid; place-items:center; background:#f4f7fb }
            .card { width: min(460px, calc(100vw - 32px)); background:white; border-radius:16px; padding:28px; box-shadow:0 12px 40px rgba(0,0,0,0.08)}
            h1{ margin:0 0 16px; font-size:28px }
            label{ display:block; margin:14px 0 6px; font-weight:600 }
            input{ width:100%; box-sizing:border-box; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:16px }
            button{ width:100%; margin-top:18px; padding:12px 14px; border:0; border-radius:10px; background:#0f766e; color:white; font-size:16px; font-weight:700; cursor:pointer }
          </style>
        </head>
        <body>
          <main class="card">
            <h1>Create account</h1>
            <form method="post" action="/api/auth/register">
              <label for="name">Full name</label>
              <input id="name" name="name" type="text" autocomplete="name" required />

              <label for="email">Email</label>
              <input id="email" name="email" type="email" autocomplete="email" required />

              <label for="password">Password</label>
              <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" />

              <button type="submit">Register</button>
            </form>
          </main>
        </body>
      </html>
    `);
  };

  forgotPassword = async (req: Request, res: Response) => {
    const validation = this.validator.validateForgotPassword(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const result = await this.service.forgotPassword(validation.payload);
      return res.json(result);
    } catch (error) {
      const message = (error as Error).message;
      if (
        message === "JWT_SECRET is not configured" ||
        message === "BACKEND_URL is not configured" ||
        message === "SMTP is not fully configured"
      ) {
        return res.status(500).json({ error: message });
      }
      return res.status(400).json({ error: message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const queryToken = req.query["token"];
    const token = typeof queryToken === "string" ? queryToken : req.body?.token;
    const validation = this.validator.validateResetPassword({
      token,
      password: req.body?.password,
    });

    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const result = await this.service.resetPassword(validation.payload);
      return res.json(result);
    } catch (error) {
      const message = (error as Error).message;
      if (message === "JWT_SECRET is not configured") {
        return res.status(500).json({ error: message });
      }
      return res.status(400).json({ error: message });
    }
  };

  resetPasswordPage = async (req: Request, res: Response) => {
    const token = req.query["token"];

    if (typeof token !== "string" || !token) {
      return res.status(400).type("html").send(`
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Reset Password</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                background: #f4f7fb;
              }
              .card {
                width: min(460px, calc(100vw - 32px));
                background: white;
                border-radius: 16px;
                padding: 28px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
              }
              h1 { margin: 0 0 12px; font-size: 28px; }
              p { color: #475569; line-height: 1.5; }
            </style>
          </head>
          <body>
            <main class="card">
              <h1>Reset Password</h1>
              <p>The reset token is missing or invalid.</p>
            </main>
          </body>
        </html>
      `);
    }

    const action = `/api/auth/reset-password?token=${encodeURIComponent(token)}`;

    return res.status(200).type("html").send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Reset Password</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: #f4f7fb;
            }
            .card {
              width: min(460px, calc(100vw - 32px));
              background: white;
              border-radius: 16px;
              padding: 28px;
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
            }
            h1 { margin: 0 0 16px; font-size: 28px; }
            label { display: block; margin: 14px 0 6px; font-weight: 600; }
            input {
              width: 100%;
              box-sizing: border-box;
              padding: 12px 14px;
              border: 1px solid #cbd5e1;
              border-radius: 10px;
              font-size: 16px;
            }
            button {
              width: 100%;
              margin-top: 18px;
              padding: 12px 14px;
              border: 0;
              border-radius: 10px;
              background: #0f766e;
              color: white;
              font-size: 16px;
              font-weight: 700;
              cursor: pointer;
            }
            .hint { margin-top: 14px; color: #475569; font-size: 14px; }
          </style>
        </head>
        <body>
          <main class="card">
            <h1>Reset Password</h1>
            <form method="post" action="${action}">
              <input type="hidden" name="token" value="${token}" />

              <label for="password">New Password</label>
              <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" />

              <button type="submit">Update password</button>
            </form>
            <p class="hint">After submitting, the password will be updated through the existing reset endpoint.</p>
          </main>
        </body>
      </html>
    `);
  };
}

const controller = new AuthController();
export const register = controller.register;
export const registerPage = controller.registerPage;
export const login = controller.login;
export const loginPage = controller.loginPage;
export const forgotPassword = controller.forgotPassword;
export const resetPassword = controller.resetPassword;
export const resetPasswordPage = controller.resetPasswordPage;
