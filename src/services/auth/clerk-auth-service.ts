import type { AuthContext, AuthenticatedUser, ServerAuthService, UserRole } from "./types";
import { AuthError } from "./types";

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

async function buildContext(_req: Request): Promise<AuthContext> {
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
      claims: undefined,
      raw: process.env.NODE_ENV === "production" ? undefined : user,
    };
  }

  // Optionally read token claims if needed
  let tokenClaims: Record<string, unknown> | null = null;
  try {
    const token = await getToken?.({ template: undefined });
    if (token) {
      // Do not decode in this layer; gateway can decide. Keep null for now.
      tokenClaims = null;
    }
  } catch {
    tokenClaims = null;
  }

  return {
    user: authenticatedUser,
    userId: userId ?? null,
    sessionId: sessionId ?? null,
    organizationId: orgId ?? null,
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


