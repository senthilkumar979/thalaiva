import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => (token?.role as string | undefined) === "admin",
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
