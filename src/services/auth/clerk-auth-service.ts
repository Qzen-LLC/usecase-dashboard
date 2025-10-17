import type { AuthContext, AuthenticatedUser, ServerAuthService, UserRole } from "./types";
import { AuthError } from "./types";
import { verifyBearerToken } from "@/utils/clerk-bearer-auth";
import { prismaClient } from "@/utils/db";

function derivePermissionsFromRoles(roles: string[] | undefined | null): string[] {
  const role = Array.isArray(roles) && roles.length > 0 ? String(roles[0]).toUpperCase() : undefined;
  const map: Record<string, string[]> = {
    QZEN_ADMIN: ["*"],
    ORG_ADMIN: ["read:*", "write:*", "delete:own"],
    ORG_USER: ["read:*", "write:own"],
    USER: ["read:own", "write:own"],
  };
  return (role && map[role]) ? map[role] : [];
}

async function getClerkServer() {
  const mod = await import("@clerk/nextjs/server");
  return { auth: mod.auth, currentUser: mod.currentUser };
}

function normalizeRoles(user: any): string[] {
  const rolesFromPublic = (user?.publicMetadata?.role
    ? [user.publicMetadata.role]
    : user?.publicMetadata?.roles) as string[] | undefined;
  const rolesFromPrivate = (user?.privateMetadata?.roles || []) as string[] | undefined;
  const rolesFromUnsafe = (user?.unsafeMetadata?.roles || []) as string[] | undefined;

  const combined = [
    ...(Array.isArray(rolesFromPublic) ? rolesFromPublic : rolesFromPublic ? [rolesFromPublic] : []),
    ...(Array.isArray(rolesFromPrivate) ? rolesFromPrivate : []),
    ...(Array.isArray(rolesFromUnsafe) ? rolesFromUnsafe : []),
  ].filter(Boolean) as string[];

  // Ensure uniqueness and strings
  return Array.from(new Set(combined.map(String)));
}

async function buildContext(req: Request): Promise<AuthContext> {
  // Clerk server helpers
  const { auth: clerkAuth, currentUser } = await getClerkServer();
  const authState = await clerkAuth();
  const { userId, sessionId, orgId, getToken } = authState as any;
  const user = await currentUser().catch(() => null);

  let authenticatedUser: AuthenticatedUser | null = null;
  if (user) {
    authenticatedUser = {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      organizationId: orgId ?? null,
      roles: normalizeRoles(user),
      permissions: derivePermissionsFromRoles(normalizeRoles(user)),
      claims: undefined,
      raw: process.env.NODE_ENV === "production" ? undefined : user,
    };
  }

  // Optionally read token claims if needed (from session token)
  let tokenClaims: Record<string, unknown> | null = null;
  try {
    const token = await getToken?.({ template: undefined });
    if (token) {
      // Leave decoding for upper layers; keep null to avoid perf cost
      tokenClaims = null;
    }
  } catch {
    tokenClaims = null;
  }

  // If no session user, try Bearer token authentication
  if (!authenticatedUser) {
    try {
      const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || undefined;
      const payload = await verifyBearerToken(authHeader).catch(() => null);
      if (payload && typeof payload.sub === "string" && payload.sub) {
        const userRecord = await prismaClient.user.findUnique({
          where: { clerkId: payload.sub },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            organizationId: true,
          },
        });
        if (userRecord) {
          authenticatedUser = {
            id: userRecord.id,
            email: userRecord.email ?? null,
            firstName: (userRecord as any).firstName ?? null,
            lastName: (userRecord as any).lastName ?? null,
            organizationId: (userRecord as any).organizationId ?? null,
            roles: userRecord.role ? [String(userRecord.role)] : [],
            permissions: derivePermissionsFromRoles(userRecord.role ? [String(userRecord.role)] : []),
            claims: payload as any,
            raw: process.env.NODE_ENV === "production" ? undefined : payload,
          };
        }
      }
    } catch {
      // ignore and continue
    }
  }

  // If still unauthenticated, try API key authentication
  if (!authenticatedUser) {
    try {
      const apiKey = req.headers.get("x-api-key") || req.headers.get("X-API-Key") || null;
      if (apiKey && process.env.API_SECRET_KEY && apiKey === process.env.API_SECRET_KEY) {
        const userRecord = await prismaClient.user.findFirst({
          where: { email: "api@system.internal" },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            organizationId: true,
          },
        });
        if (userRecord) {
          authenticatedUser = {
            id: userRecord.id,
            email: userRecord.email ?? null,
            firstName: (userRecord as any).firstName ?? null,
            lastName: (userRecord as any).lastName ?? null,
            organizationId: (userRecord as any).organizationId ?? null,
            roles: userRecord.role ? [String(userRecord.role)] : [],
            permissions: derivePermissionsFromRoles(userRecord.role ? [String(userRecord.role)] : []),
            claims: undefined,
            raw: process.env.NODE_ENV === "production" ? undefined : { apiKeyUser: true },
          };
        }
      }
    } catch {
      // ignore and continue
    }
  }

  return {
    user: authenticatedUser,
    userId: authenticatedUser ? (userId ?? authenticatedUser.id) : (userId ?? null),
    sessionId: sessionId ?? null,
    organizationId: authenticatedUser?.organizationId ?? (orgId ?? null),
    tokenClaims,
    provider: "CLERK",
  };
}

export const clerkAuthService: ServerAuthService = {
  provider: "CLERK",

  async getAuthContext(req: Request): Promise<AuthContext> {
    return buildContext(req);
  },

  async requireUser(req: Request): Promise<AuthContext> {
    const ctx = await buildContext(req);
    if (!ctx.user || !ctx.userId) {
      throw new AuthError("Authentication required", "UNAUTHENTICATED", 401);
    }
    return ctx;
  },

  async hasRole(req: Request, roles: UserRole[]): Promise<boolean> {
    const ctx = await buildContext(req);
    if (!ctx.user || !ctx.user.roles || ctx.user.roles.length === 0) return false;
    const target = new Set(roles.map((r) => r.toUpperCase()));
    for (const role of ctx.user.roles) {
      if (target.has(String(role).toUpperCase())) return true;
    }
    return false;
  },

  getBearerToken(req: Request): string | null {
    const header = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!header) return null;
    const parts = header.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
    return null;
  },
};

export default clerkAuthService;


