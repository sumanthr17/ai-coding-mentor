import { Router } from "express";

import { AppError } from "../errors/app-error.js";
import { validate } from "../middleware/validate.js";
import { explainSchema, hintSchema } from "../schemas/api.js";

export const mentorRouter = Router();

mentorRouter.post("/explain", validate(explainSchema), (_req, _res, next) => {
  next(new AppError("Error explanations are not implemented yet. Gemini integration has not been configured.", 501));
});

mentorRouter.post("/hint", validate(hintSchema), (_req, _res, next) => {
  next(new AppError("Progressive hints are not implemented yet. Gemini integration has not been configured.", 501));
});
