import express from "express";
import type { Request, Response } from "express";
import morgan from "morgan";

const app = express();
const PORT = process.env["PORT"] || 3000;

// Middleware to parse incoming JSON and HTML form submissions
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Sample Route
app.get("/", (_req: Request, res: Response) => {
  res.send({ message: "Hello, TypeScript with Express!" });
});

// Mount crop module routes
import cropModuleRouter from "./modules/crop/index.js";
import authModuleRouter from "./modules/auth/index.js";
import geminiModuleRouter from "./modules/gemini/index.js";
import deepseekModuleRouter from "./modules/deepseek/index.js";
import googlePlacesModuleRouter from "./modules/googlePlaces/index.js";
app.use("/api/auth", authModuleRouter);
app.use("/api/crop", cropModuleRouter);
app.use("/api/gemini", geminiModuleRouter);
app.use("/api/deepseek", deepseekModuleRouter);
app.use("/api/google-places", googlePlacesModuleRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
