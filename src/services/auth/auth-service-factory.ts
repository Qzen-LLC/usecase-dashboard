import type { ServerAuthService } from "./types";
import { clerkAuthService } from "./clerk-auth-service";

let cachedService: ServerAuthService | null = null;

function readProvider(): string {
  if (typeof process !== "undefined" && process.env) {
    return (process.env.AUTH_PROVIDER || process.env.NEXT_PUBLIC_AUTH_PROVIDER || "CLERK").toUpperCase();
  }
  return "CLERK";
}

export function getAuthService(): ServerAuthService {
  if (cachedService) return cachedService;

  const provider = readProvider();
  switch (provider) {
    case "CLERK":
      cachedService = clerkAuthService;
      break;
    default:
      // Fallback to Clerk to keep system operational
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[auth] Unknown AUTH_PROVIDER '${provider}', falling back to Clerk.`);
      }
      cachedService = clerkAuthService;
  }

  return cachedService;
}

export default getAuthService;


