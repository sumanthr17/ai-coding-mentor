import { z } from "zod";

const code = z.string().min(1, "Code cannot be empty.").max(50_000, "Code must be 50,000 characters or fewer.");

export const runCodeSchema = z.object({
  code,
  stdin: z.string().max(10_000, "Standard input must be 10,000 characters or fewer.").default(""),
});

export const explainSchema = z.object({
  code,
  compileOutput: z.string().min(1, "Compile output cannot be empty.").max(20_000, "Compile output must be 20,000 characters or fewer."),
});

export const hintSchema = z.object({
  code,
  problemId: z.string().min(1, "Problem ID cannot be empty.").max(100),
  hintLevel: z.number().int().min(1).max(3),
});

export const puzzleParamsSchema = z.object({
  id: z.string().min(1, "Puzzle ID cannot be empty.").max(100),
});

export const puzzleSubmitSchema = z.object({ code });
