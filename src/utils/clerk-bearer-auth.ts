import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

const clerkIssuer = process.env.CLERK_ISSUER || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[1] || '';

function getIssuerUrl(): string {
  // Prefer explicit issuer env; else construct from frontend domain if available
  if (process.env.CLERK_JWT_ISSUER) return process.env.CLERK_JWT_ISSUER;
  if (process.env.NEXT_PUBLIC_CLERK_FRONTEND_API) {
    const domain = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API; // e.g., clerk.abcd.lcl.dev
    return `https://${domain}`;
  }
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    // Not reliable for issuer; user should set CLERK_JWT_ISSUER
  }
  return process.env.CLERK_JWT_ISSUER || '';
}

const ISSUER = getIssuerUrl();
const JWKS = ISSUER ? createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`)) : null;

export async function verifyBearerToken(authorizationHeader?: string): Promise<JWTPayload | null> {
  if (!authorizationHeader || !authorizationHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  const token = authorizationHeader.slice(7).trim();
  if (!token) return null;
  if (!JWKS || !ISSUER) throw new Error('Clerk issuer not configured. Set CLERK_JWT_ISSUER or NEXT_PUBLIC_CLERK_FRONTEND_API');
  const { payload } = await jwtVerify(token, JWKS, { issuer: ISSUER });
  return payload;
}



