import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";

export async function middleware(request: NextRequest) {
  // Only protect project routes
  if (
    request.nextUrl.pathname.startsWith("/project") &&
    request.nextUrl.pathname !== "/project/new"
  ) {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/handler/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/project/:path*",
};
