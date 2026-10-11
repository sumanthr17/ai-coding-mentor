/**
 * AI Coding Mentor - API Client
 * Reusable client for communicating with the Node.js/Express backend.
 * Conforms strictly to docs/api-contract.md.
 */

import type {
  RunCodeRequest,
  RunCodeResponse,
  ExplainErrorRequest,
  ExplainErrorResponse,
  ProgressiveHintRequest,
  ProgressiveHintResponse,
  PuzzleListResponse,
  SubmitPuzzleRequest,
  SubmitPuzzleResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  isBackendUnavailable: boolean;
  statusCode?: number;

  constructor(message: string, isBackendUnavailable = false, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.isBackendUnavailable = isBackendUnavailable;
    this.statusCode = statusCode;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        const json = await response.json();
        errorBody = json.message || json.error || JSON.stringify(json);
      } catch {
        errorBody = await response.text();
      }
      throw new ApiError(
        errorBody || `HTTP request failed with status ${response.status}`,
        false,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error (e.g. ECONNREFUSED, Failed to fetch, CORS failure when offline)
    const message = `Backend service is unavailable at ${API_BASE_URL}. Ensure the backend server is running (e.g., 'npm run dev' in backend/).`;
    throw new ApiError(message, true);
  }
}

export const apiClient = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  /**
   * Check if backend is reachable via GET /api/health
   */
  async checkHealth(): Promise<{ online: boolean; message: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return {
        online: res.ok,
        message: res.ok ? 'Backend is online' : `Backend responded with HTTP ${res.status}`,
      };
    } catch {
      return {
        online: false,
        message: `Backend unavailable at ${API_BASE_URL}`,
      };
    }
  },

  /**
   * 1. Run C Code
   * POST /code/run
   */
  async runCode(code: string, stdin = ''): Promise<RunCodeResponse> {
    const payload: RunCodeRequest = { code, stdin };
    return request<RunCodeResponse>('/code/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 2. Explain an Error
   * POST /mentor/explain
   */
  async explainError(code: string, compileOutput: string): Promise<ExplainErrorResponse> {
    const payload: ExplainErrorRequest = { code, compileOutput };
    return request<ExplainErrorResponse>('/mentor/explain', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 3. Get a Progressive Hint
   * POST /mentor/hint
   */
  async getHint(code: string, problemId: string, hintLevel: number): Promise<ProgressiveHintResponse> {
    const payload: ProgressiveHintRequest = { code, problemId, hintLevel };
    return request<ProgressiveHintResponse>('/mentor/hint', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 4. Get Challenges
   * GET /puzzles
   */
  async getPuzzles(): Promise<PuzzleListResponse> {
    return request<PuzzleListResponse>('/puzzles', {
      method: 'GET',
    });
  },

  /**
   * 5. Submit a Challenge
   * POST /puzzles/:id/submit
   */
  async submitPuzzle(puzzleId: string, code: string): Promise<SubmitPuzzleResponse> {
    const payload: SubmitPuzzleRequest = { code };
    return request<SubmitPuzzleResponse>(`/puzzles/${encodeURIComponent(puzzleId)}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
