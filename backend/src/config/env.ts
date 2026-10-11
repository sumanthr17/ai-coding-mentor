import "dotenv/config";

const defaultCorsOrigin = "http://localhost:5173";

function parsePort(value: string | undefined): number {
  const port = Number(value ?? "3001");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return port;
}

export const env = {
  port: parsePort(process.env.PORT),
  oneCompilerApiKey: process.env.ONECOMPILER_API_KEY?.trim(),
  corsOrigins: (process.env.CORS_ORIGIN ?? defaultCorsOrigin)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
