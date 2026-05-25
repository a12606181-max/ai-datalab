import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "ai-datalab-local-secret-key");
const protectedRoutes = [
  "/dashboard",
  "/courses",
  "/lessons",
  "/labs",
  "/datasets",
  "/mentor",
  "/notifications",
  "/progress",
  "/teacher",
  "/profile",
  "/search",
  "/settings",
  "/admin",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("aidatalab_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    if (pathname.startsWith("/teacher") && payload.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/dashboard?error=access-denied", request.url));
    }

    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=access-denied", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*", "/lessons/:path*", "/labs/:path*", "/datasets/:path*", "/mentor/:path*", "/notifications/:path*", "/progress/:path*", "/teacher/:path*", "/profile/:path*", "/search/:path*", "/settings/:path*", "/admin/:path*"],
};
