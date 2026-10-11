import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { codeRouter } from "./routes/code.js";
import { mentorRouter } from "./routes/mentor.js";
import { puzzlesRouter } from "./routes/puzzles.js";

export const app = express();

app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "AI Coding Mentor API is running." });
});

app.use("/api/code", codeRouter);
app.use("/api/mentor", mentorRouter);
app.use("/api/puzzles", puzzlesRouter);

app.use(notFoundHandler);
app.use(errorHandler);
