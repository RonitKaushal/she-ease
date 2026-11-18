export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/pro/:path*", "/booking/:path*", "/admin/:path*"],
};
