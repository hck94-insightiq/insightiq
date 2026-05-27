import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if ((path === "/login" || path === "/register") && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }: { token: any; req: any }) => {
        const path = req.nextUrl.pathname;
        if (path === "/login" || path === "/register") return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/login",
    "/register",
    "/onboarding",
    "/dashboard/:path*",
    "/admin/:path*",
    "/analysis",
    "/chat",
    "/recommendations",
    "/wishlist",
    "/settings",
  ],
};
