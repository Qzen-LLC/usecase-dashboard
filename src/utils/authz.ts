import { auth } from '@clerk/nextjs/server';

type NullableString = string | null | undefined;

export type AppSessionClaims = {
  appRole?: NullableString; // e.g., QZEN_ADMIN, ORG_ADMIN, ORG_USER, USER
  organizationId?: NullableString; // your internal org id if mirrored in Clerk
  dbUserId?: NullableString; // your Prisma User.id if mirrored in Clerk
  [key: string]: unknown;
};

export type AuthContext = {
  userId: string;
  role: string | null;
  organizationId: string | null;
  dbUserId: string | null;
  claims: AppSessionClaims;
};

export function getClaimsFromSession(): AppSessionClaims {
  const { sessionClaims } = auth();
  return (sessionClaims as AppSessionClaims) || {};
}

export function getAuthContext(): AuthContext | null {
  const { userId, sessionClaims } = auth();
  if (!userId) return null;
  const claims = (sessionClaims as AppSessionClaims) || {};
  const role = (claims.appRole as string | undefined) ?? null;
  const organizationId = (claims.organizationId as string | undefined) ?? null;
  const dbUserId = (claims.dbUserId as string | undefined) ?? null;
  return { userId, role, organizationId, dbUserId, claims };
}

export function requireAuthContext(): AuthContext {
  const ctx = getAuthContext();
  if (!ctx) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  return ctx;
}

export function isQzenAdmin(ctx: AuthContext | null): boolean {
  return !!ctx?.role && ctx.role === 'QZEN_ADMIN';
}

export function hasOrgAccess(ctx: AuthContext | null, orgId?: string | null): boolean {
  if (!orgId) return false;
  return !!ctx?.organizationId && ctx.organizationId === orgId;
}


