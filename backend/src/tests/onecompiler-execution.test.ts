import assert from "node:assert/strict";
import test from "node:test";

import { OneCompilerExecutionService } from "../services/onecompiler-execution.service.js";

const request = { code: "int main(void) { return 0; }", stdin: "" };

type Diagnostic = { requestId: string; httpStatus: number; providerErrorCode?: string };

function serviceWith(payload: unknown, status = 200, diagnostics: Diagnostic[] = []): OneCompilerExecutionService {
  const fetchFn: typeof fetch = async () => new Response(JSON.stringify(payload), { status });
  return new OneCompilerExecutionService({ apiKey: "test-key", fetchFn, diagnosticLogger: (diagnostic) => diagnostics.push(diagnostic) });
}

test("maps a successful mocked OneCompiler response to the frontend contract", async () => {
  const result = await serviceWith({ status: "success", stdout: "Hello\n", stderr: null, exception: null }).execute(request);

  assert.deepEqual(result, {
    success: true,
    stdout: "Hello\n",
    stderr: "",
    compileOutput: "",
    exitCode: 0,
  });
});

test("places mocked compilation diagnostics in compileOutput", async () => {
  const result = await serviceWith({
    status: "success",
    stdout: null,
    stderr: "",
    exception: "Compilation failed: expected ';' before '}' token",
  }).execute(request);

  assert.equal(result.success, false);
  assert.match(result.compileOutput, /Compilation failed/);
  assert.equal(result.stderr, "");
  assert.equal(result.exitCode, 1);
});

test("keeps a mocked runtime exception out of compileOutput", async () => {
  const result = await serviceWith({
    status: "success",
    stdout: "",
    stderr: "",
    exception: "Segmentation fault",
  }).execute(request);

  assert.equal(result.success, false);
  assert.equal(result.compileOutput, "");
  assert.equal(result.stderr, "Segmentation fault");
});

test("turns mocked invalid-key and exhausted-credit responses into safe errors", async () => {
  await assert.rejects(
    serviceWith({ status: "failed", error: "E003: invalid access_token" }).execute(request),
    { message: "Code execution service authentication failed. Please contact the administrator." },
  );

  await assert.rejects(
    serviceWith({ status: "failed", error: "E002: API quota exceeded" }).execute(request),
    { message: "Code execution limit has been reached. Please try again later." },
  );
});

test("turns OneCompiler's documented provider timeout payload into a gateway timeout", async () => {
  await assert.rejects(
    serviceWith({ status: "success", error: "E001: operation timed out" }).execute(request),
    { message: "Code execution service timed out. Please try again with a simpler program." },
  );
});

test("treats HTTP 403 with a non-authentication error as a provider rejection", async () => {
  const diagnostics: Diagnostic[] = [];

  await assert.rejects(
    serviceWith({ status: "failed", error: "E006: unsupported language c" }, 403, diagnostics).execute(request),
    { message: "Code execution service rejected this request. Please contact the administrator." },
  );

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0]?.httpStatus, 403);
  assert.equal(diagnostics[0]?.providerErrorCode, "E006");
  assert.match(diagnostics[0]?.requestId ?? "", /^[0-9a-f-]{36}$/i);
});

test("treats HTTP 403 with E003 as an authentication failure", async () => {
  const diagnostics: Diagnostic[] = [];

  await assert.rejects(
    serviceWith({ status: "failed", error: "E003: invalid access_token" }, 403, diagnostics).execute(request),
    { message: "Code execution service authentication failed. Please contact the administrator." },
  );

  assert.deepEqual(
    { httpStatus: diagnostics[0]?.httpStatus, providerErrorCode: diagnostics[0]?.providerErrorCode },
    { httpStatus: 403, providerErrorCode: "E003" },
  );
});

test("treats HTTP 401 without a JSON provider error as an authentication failure", async () => {
  const diagnostics: Diagnostic[] = [];
  const fetchFn: typeof fetch = async () => new Response("Unauthorized", { status: 401 });
  const service = new OneCompilerExecutionService({
    apiKey: "test-key",
    fetchFn,
    diagnosticLogger: (diagnostic) => diagnostics.push(diagnostic),
  });

  await assert.rejects(
    service.execute(request),
    { message: "Code execution service authentication failed. Please contact the administrator." },
  );

  assert.deepEqual(diagnostics, [{ requestId: diagnostics[0]?.requestId, httpStatus: 401 }]);
  assert.match(diagnostics[0]?.requestId ?? "", /^[0-9a-f-]{36}$/i);
});
