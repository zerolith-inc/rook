import { Effect, Schema } from "effect";
import { createApp } from "./app";

const Port = Schema.NumberFromString.pipe(Schema.int(), Schema.between(1, 65535));
const port = Effect.runSync(Schema.decodeUnknown(Port)(Bun.env.PORT ?? "3001"));
const app = createApp(Bun.env.APP_ORIGIN ?? "http://localhost:8081");
const server = Bun.serve({ hostname: "127.0.0.1", port, fetch: app.fetch });
console.log(`Rook API listening on ${server.url}`);

const shutdown = async () => {
  await server.stop();
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
