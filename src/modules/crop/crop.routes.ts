import express from "express";
import { identify, uploadPage } from "./crop.controller.js";
import { checkAuthentication } from "../../middleware/checkAuthentication.js";
import { cropRateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.use(cropRateLimiter);

router.get("/upload", uploadPage);
// POST /api/crop/identify
router.post("/identify", checkAuthentication, identify);

export default router;
