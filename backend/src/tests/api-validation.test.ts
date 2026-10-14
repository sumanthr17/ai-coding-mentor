import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { app } from "../app.js";

async function withServer(callback: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));

  try {
    const { port } = server.address() as AddressInfo;
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test("rejects an invalid run request before it can reach the execution provider", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/code/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "", stdin: "" }),
    });

    assert.equal(response.status, 400);
    const body = await response.json() as { message: string };
    assert.equal(body.message, "Request validation failed.");
  });
});

test("permits the Vite development origin to preflight the run route", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/code/run`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.match(response.headers.get("access-control-allow-methods") ?? "", /POST/);
  });
});
