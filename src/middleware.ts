import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleRoutes: Record<string, string[]> = {
  "/dashboard/setari": ["ADMIN"],
  "/dashboard/rapoarte/venituri": ["ADMIN"],
  "/dashboard/rapoarte": ["ADMIN", "OPERATOR"],
  "/dashboard/clienti": ["ADMIN", "OPERATOR"],
  "/dashboard/colete/nou": ["ADMIN", "OPERATOR"],
  "/dashboard/curse/noua": ["ADMIN", "OPERATOR"],
  "/dashboard": ["ADMIN", "OPERATOR", "COURIER", "CLIENT"],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as string;

    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
