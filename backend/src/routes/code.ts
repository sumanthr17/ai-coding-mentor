import { Router } from "express";

import { env } from "../config/env.js";
import { validate } from "../middleware/validate.js";
import { runCodeSchema } from "../schemas/api.js";
import { OneCompilerExecutionService } from "../services/onecompiler-execution.service.js";

export const codeRouter = Router();
const oneCompiler = new OneCompilerExecutionService({ apiKey: env.oneCompilerApiKey });

codeRouter.post("/run", validate(runCodeSchema), async (req, res, next) => {
  try {
    const result = await oneCompiler.execute(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
