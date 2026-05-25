import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/constants";

function createLogoutResponse() {
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/login",
    },
  });

  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET() {
  return createLogoutResponse();
}

export async function POST() {
  return createLogoutResponse();
}
