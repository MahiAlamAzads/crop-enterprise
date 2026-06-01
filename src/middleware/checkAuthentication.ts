import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function extractToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  const accessToken = req.headers["x-access-token"];
  if (typeof accessToken === "string" && accessToken.trim()) {
    return accessToken.trim();
  }

  return null;
}

export function checkAuthentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    return res.status(500).json({ error: "JWT_SECRET is not configured" });
  }

  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    (req as Request & { user?: unknown }).user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
