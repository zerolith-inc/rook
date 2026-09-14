import { describe, expect, test } from "bun:test";
import { HealthResponse } from "@rook/contracts";
import { Schema } from "effect";
import { createApp } from "./app";

describe("API bootstrap", () => {
  const app = createApp();
  test("reports API liveness without claiming DSH is connected", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);
    expect(Schema.decodeUnknownSync(HealthResponse)(await response.json())).toEqual({
      status: "ok",
      service: "rook-api",
      runtime: "not-configured",
    });
  });
  test("allows the configured web origin", async () => {
    const response = await app.request("/health", { headers: { Origin: "http://localhost:8081" } });
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:8081");
  });
  test("does not allow unrelated origins", async () => {
    const response = await app.request("/health", { headers: { Origin: "https://example.com" } });
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
  test("unknown routes are not healthy responses", async () => {
    expect((await app.request("/missing")).status).toBe(404);
  });
});
