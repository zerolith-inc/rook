import { HealthResponse } from "@rook/contracts";
import { Schema } from "effect";

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export const fetchHealth = async (signal?: AbortSignal) => {
  const response = await fetch(new URL("/health", apiUrl), { signal });
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  return Schema.decodeUnknownSync(HealthResponse)(await response.json());
};
