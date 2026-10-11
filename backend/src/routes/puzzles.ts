import { Router } from "express";

import { AppError } from "../errors/app-error.js";
import { validate } from "../middleware/validate.js";
import { puzzleParamsSchema, puzzleSubmitSchema } from "../schemas/api.js";

export const puzzlesRouter = Router();

puzzlesRouter.get("/", (_req, _res, next) => {
  next(new AppError("Challenge catalog is not implemented yet.", 501));
});

puzzlesRouter.post("/:id/submit", validate(puzzleParamsSchema, "params"), validate(puzzleSubmitSchema), (_req, _res, next) => {
  next(new AppError("Challenge submission validation is not implemented yet.", 501));
});
