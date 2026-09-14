import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Rook</title>
        <meta name="description" content="Rook — a team of agents, built on DSH." />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
