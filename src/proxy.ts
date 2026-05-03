import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (formerly known as middleware) — gates the `/admin` route with
 * HTTP Basic Auth. Browsers prompt natively for username + password.
 *
 * Credentials live in env vars `ADMIN_USER` (defaults to "admin") and
 * `ADMIN_PASSWORD` (required for the gate to engage). If
 * `ADMIN_PASSWORD` is unset the route returns 503 Service Unavailable
 * — better than silently exposing the RSVP table.
 */
export function proxy(request: NextRequest): NextResponse {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedUser = process.env.ADMIN_USER ?? "admin";

  if (!expectedPassword) {
    return new NextResponse(
      "Admin access not configured — set ADMIN_PASSWORD.",
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice("Basic ".length));
      const idx = decoded.indexOf(":");
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (user === expectedUser && pass === expectedPassword) {
        return NextResponse.next();
      }
    } catch {
      // fall through to challenge
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Wedding Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
