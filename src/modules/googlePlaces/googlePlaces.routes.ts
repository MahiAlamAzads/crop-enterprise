import express from "express";
import { agroNearby, nearestAgro } from "./googlePlaces.controller.js";

const router = express.Router();

router.get("/agro-nearby", agroNearby);
router.post("/nearest-agro", nearestAgro);

export default router;
