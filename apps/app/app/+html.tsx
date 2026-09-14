import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const Root = ({ children }: PropsWithChildren) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="light dark" />
      <title>Rook</title>
      <meta
        name="description"
        content="Rook — a team of agents, built on DSH."
      />
      <ScrollViewStyleReset />
    </head>
    <body>{children}</body>
  </html>
);

export default Root;
