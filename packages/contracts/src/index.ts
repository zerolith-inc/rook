import { Schema } from "effect";

export const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
  service: Schema.Literal("rook-api"),
  runtime: Schema.Literal("not-configured"),
});
export type HealthResponse = typeof HealthResponse.Type;
