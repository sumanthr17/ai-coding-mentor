import { AppError } from "../errors/app-error.js";
import { randomUUID } from "node:crypto";

const ONECOMPILER_RUN_URL = "https://api.onecompiler.com/v1/run";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_CHARS = 20_000;

export interface CodeExecutionRequest {
  code: string;
  stdin: string;
}

export interface CodeExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number;
}

interface OneCompilerResponse {
  stdout?: string | null;
  stderr?: string | null;
  exception?: string | null;
  status?: string;
  error?: string;
}

type FetchFunction = typeof fetch;
type ProviderDiagnostic = {
  requestId: string;
  httpStatus: number;
  providerErrorCode?: string;
};
type ProviderDiagnosticLogger = (diagnostic: ProviderDiagnostic) => void;

export interface OneCompilerExecutionServiceOptions {
  apiKey?: string;
  fetchFn?: FetchFunction;
  timeoutMs?: number;
  diagnosticLogger?: ProviderDiagnosticLogger;
}

/**
 * Calls OneCompiler's remote sandbox. This service deliberately contains no
 * local process, compiler, or shell invocation.
 */
export class OneCompilerExecutionService {
  private readonly apiKey: string | undefined;
  private readonly fetchFn: FetchFunction;
  private readonly timeoutMs: number;
  private readonly diagnosticLogger: ProviderDiagnosticLogger;

  constructor(options: OneCompilerExecutionServiceOptions) {
    this.apiKey = options.apiKey;
    this.fetchFn = options.fetchFn ?? fetch;
    this.timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
    this.diagnosticLogger = options.diagnosticLogger ?? logProviderDiagnostic;
  }

  async execute(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    if (!this.apiKey) {
      throw new AppError("Code execution is not configured. Set ONECOMPILER_API_KEY on the backend.", 503);
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(ONECOMPILER_RUN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({
          language: "c",
          stdin: request.stdin,
          files: [{ name: "main.c", content: request.code }],
        }),
        signal: abortController.signal,
      });

      const payload = await this.readPayload(response);

      if (!response.ok) {
        throw this.toProviderError(response.status, payload.error);
      }

      if (payload.status === "failed" || payload.error) {
        throw this.toProviderError(response.status, payload.error);
      }

      return this.toExecutionResult(payload);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AppError("Code execution service timed out. Please try again with a simpler program.", 504);
      }

      throw new AppError("Code execution service is temporarily unavailable. Please try again later.", 502);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async readPayload(response: Response): Promise<OneCompilerResponse> {
    try {
      return (await response.json()) as OneCompilerResponse;
    } catch {
      if (!response.ok) {
        return {};
      }

      throw new AppError("Code execution service returned an invalid response.", 502);
    }
  }

  private toProviderError(status: number, providerError: string | undefined): AppError {
    const errorCode = providerError?.match(/\b(E\d{3}):/)?.[1];
    this.diagnosticLogger({
      requestId: randomUUID(),
      httpStatus: status,
      ...(errorCode ? { providerErrorCode: errorCode } : {}),
    });

    if (errorCode === "E003" || errorCode === "E004" || (status === 401 && !errorCode)) {
      return new AppError("Code execution service authentication failed. Please contact the administrator.", 503);
    }

    if (status === 429 || errorCode === "E002") {
      return new AppError("Code execution limit has been reached. Please try again later.", 429);
    }

    if (errorCode === "E001") {
      return new AppError("Code execution service timed out. Please try again with a simpler program.", 504);
    }

    if (status === 403) {
      return new AppError("Code execution service rejected this request. Please contact the administrator.", 502);
    }

    return new AppError("Code execution service could not process this request. Please try again later.", 502);
  }

  private toExecutionResult(payload: OneCompilerResponse): CodeExecutionResult {
    const stdout = truncate(payload.stdout ?? "");
    const stderr = truncate(payload.stderr ?? "");
    const exception = truncate(payload.exception ?? "");

    if (!exception) {
      return { success: true, stdout, stderr, compileOutput: "", exitCode: 0 };
    }

    // OneCompiler exposes exceptions as text rather than a structured phase.
    // Preserve likely compiler diagnostics in compileOutput; other failures are runtime errors.
    if (/(compile|compilation|compiler|syntax error)/i.test(exception)) {
      return { success: false, stdout, stderr, compileOutput: exception, exitCode: 1 };
    }

    return {
      success: false,
      stdout,
      stderr: stderr || exception,
      compileOutput: "",
      exitCode: 1,
    };
  }
}

function logProviderDiagnostic(diagnostic: ProviderDiagnostic): void {
  // Deliberately limited to non-sensitive metadata. Do not add key, headers,
  // source code, stdin, or the provider response body to this log.
  console.warn("OneCompiler provider request failed.", diagnostic);
}

function truncate(value: string): string {
  if (value.length <= MAX_OUTPUT_CHARS) {
    return value;
  }

  return `${value.slice(0, MAX_OUTPUT_CHARS)}\n[Output truncated by AI Coding Mentor]`;
}
