export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/customers/:path*",
    "/api/customer-assets/:path*",
    "/api/visits/:path*",
    "/api/users/:path*",
    "/api/audit/:path*",
    "/api/dashboard",
    "/api/history",
    "/login",
  ],
};
