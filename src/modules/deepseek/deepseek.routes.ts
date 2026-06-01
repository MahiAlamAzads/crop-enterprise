import express from "express";
import { recoveryInstructions } from "./deepseek.controller.js";

const router = express.Router();

router.post("/recovery-instructions", recoveryInstructions);

export default router;
