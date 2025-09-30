import type { ClientAuthService } from "./types";
import { clerkClientAuthService } from "./clerk-client";

function readAuthProvider(): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    return process.env.NEXT_PUBLIC_AUTH_PROVIDER || process.env.AUTH_PROVIDER;
  }
  return undefined;
}

export function getClientAuthService(): ClientAuthService {
  const provider = (readAuthProvider() || "CLERK").toUpperCase();

  switch (provider) {
    case "CLERK":
      return clerkClientAuthService;
    default:
      // Fallback to Clerk for now; future: add other providers or a no-op
      return clerkClientAuthService;
  }
}

export type { ClientAuthService } from "./types";


