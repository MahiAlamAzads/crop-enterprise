import express from "express";
import {
  forgotPassword,
  login,
  loginPage,
  registerPage,
  register,
  resetPasswordPage,
  resetPassword,
} from "./auth.controller.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.use(authRateLimiter);

router.post("/register", register);
router.get("/register", registerPage);
router.get("/login", loginPage);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password", resetPasswordPage);
router.post("/reset-password", resetPassword);

export default router;
