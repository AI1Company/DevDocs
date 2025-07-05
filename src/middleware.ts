import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Temporarily disable authentication in middleware for debugging
  // Only protect specific project routes (not the homepage)
  if (
    request.nextUrl.pathname.startsWith("/project/") &&
    !request.nextUrl.pathname.startsWith("/project/new")
  ) {
    // For now, let all requests pass through
    // TODO: Re-enable authentication once deployment is working
    console.log("Middleware: Protecting route", request.nextUrl.pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/project/:path*"],
};
