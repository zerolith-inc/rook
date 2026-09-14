import { promisify } from "node:util";

import { serve } from "@hono/node-server";
import { Effect, Schema } from "effect";

import { createApp } from "./app.ts";

const Port = Schema.NumberFromString.pipe(
  Schema.int(),
  Schema.between(1, 65_535)
);
const port = Effect.runSync(
  Schema.decodeUnknown(Port)(process.env.PORT ?? "3001")
);
const hostname = "127.0.0.1";
const app = createApp(process.env.APP_ORIGIN ?? "http://localhost:8081");
const server = serve({ fetch: app.fetch, hostname, port }, () => {
  console.log(`Rook API listening on http://${hostname}:${port}`);
});
const close = promisify(server.close.bind(server));

const shutdown = async () => {
  try {
    await close();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
