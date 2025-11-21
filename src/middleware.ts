import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedURLs = [
  "dnx",
  "dnxflow",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/")) {
    const urls = pathname.split("/")[2];
    if (urls && !allowedURLs.includes(urls)) {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:urls*"], // 정확히 /chat/ 하위만 검사
};
