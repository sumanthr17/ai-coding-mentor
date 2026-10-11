/**
 * AI Coding Mentor - API Types (V1 Contract)
 * Aligned strictly with docs/api-contract.md
 */

export interface RunCodeRequest {
  code: string;
  stdin: string;
}

export interface RunCodeResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number;
}

export interface ExplainErrorRequest {
  code: string;
  compileOutput: string;
}

export interface ExplainErrorResponse {
  explanation: string;
  suggestion: string;
}

export interface ProgressiveHintRequest {
  code: string;
  problemId: string;
  hintLevel: number;
}

export interface ProgressiveHintResponse {
  hint: string;
  hintLevel: number;
}

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export interface Puzzle {
  id: string;
  title: string;
  topic: string;
  difficulty: PuzzleDifficulty;
  description: string;
  starterCode: string;
}

export interface PuzzleListResponse {
  puzzles: Puzzle[];
}

export interface SubmitPuzzleRequest {
  code: string;
}

export interface SubmitPuzzleResponse {
  passed: boolean;
  feedback: string;
}

export interface ApiClientError {
  message: string;
  isBackendUnavailable: boolean;
  status?: number;
}
