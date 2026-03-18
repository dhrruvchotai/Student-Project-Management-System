import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role-to-route mapping: which role is allowed for which path prefix
const ROLE_ROUTE_MAP: Record<string, string> = {
  "/admin": "admin",
  "/staff": "staff",
  "/student": "student",
};

/**
 * Decode a JWT payload without verification (Edge-compatible).
 * Full cryptographic verification happens server-side in the API routes.
 * The middleware acts as a fast guard layer to prevent unauthorized page loads.
 */
function decodeJwtPayload(token: string): { userId: number; email: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → Base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const payload = JSON.parse(json);

    if (payload && payload.userId && payload.role) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Determine which role is required for this path
  let requiredRole: string | null = null;
  for (const [prefix, role] of Object.entries(ROLE_ROUTE_MAP)) {
    if (pathname.startsWith(prefix)) {
      requiredRole = role;
      break;
    }
  }

  // If no matching role prefix, allow the request through
  if (!requiredRole) {
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decode the token payload
  const payload = decodeJwtPayload(token);

  // Invalid token → redirect to login
  if (!payload) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Wrong role → redirect to unauthorized page
  if (payload.role !== requiredRole) {
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Authorized → allow the request
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/student/:path*"],
};
