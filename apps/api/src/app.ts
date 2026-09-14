import { HealthResponse } from "@rook/contracts";
import { runtimeStatus } from "@rook/dsh-adapter";
import { Effect, Schema } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";

export const createApp = (origin = "http://localhost:8081") => {
  const app = new Hono();
  app.use("*", cors({ origin, allowMethods: ["GET"] }));
  app.get("/health", async (c) => {
    const health = await Effect.runPromise(
      Schema.decodeUnknown(HealthResponse)({
        status: "ok",
        service: "rook-api",
        runtime: runtimeStatus,
      })
    );
    return c.json(health);
  });
  return app;
};
