import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { HealthResponse } from "@rook/contracts";
import { Schema } from "effect";

import { createApp } from "./app.ts";

describe("API bootstrap", () => {
  const app = createApp();
  it("reports API liveness without claiming DSH is connected", async () => {
    const response = await app.request("/health");
    assert.equal(response.status, 200);
    assert.deepEqual(
      Schema.decodeUnknownSync(HealthResponse)(await response.json()),
      {
        status: "ok",
        service: "rook-api",
        runtime: "not-configured",
      }
    );
  });
  it("allows the configured web origin", async () => {
    const response = await app.request("/health", {
      headers: { Origin: "http://localhost:8081" },
    });
    assert.equal(
      response.headers.get("Access-Control-Allow-Origin"),
      "http://localhost:8081"
    );
  });
  it("does not allow unrelated origins", async () => {
    const response = await app.request("/health", {
      headers: { Origin: "https://example.com" },
    });
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  });
  it("unknown routes are not healthy responses", async () => {
    const response = await app.request("/missing");
    assert.equal(response.status, 404);
  });
});
