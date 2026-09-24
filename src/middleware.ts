import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown>) => {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: Record<string, unknown>) => {
          req.cookies.set({ name, value: "", ...options });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Protect admin routes (except login page)
  if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
    if (!session) {
      const redirectUrl = new URL("/admin/login", req.url);
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect provider routes — must be signed in (provider-role checked in APIs).
  // Provider login/apply pages are public. In DEMO mode (beta investor demo) the
  // fixture-backed provider portal is viewable without a session; it exposes no
  // real records and performs no writes.
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (
    !demoMode &&
    req.nextUrl.pathname.startsWith("/provider") &&
    !req.nextUrl.pathname.startsWith("/provider/login") &&
    !req.nextUrl.pathname.startsWith("/provider/apply")
  ) {
    if (!session) {
      const redirectUrl = new URL("/provider/login", req.url);
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect runner routes (except register and login pages)
  if (
    req.nextUrl.pathname.startsWith("/runner") &&
    !req.nextUrl.pathname.startsWith("/runner/register") &&
    !req.nextUrl.pathname.startsWith("/runner/login") &&
    !req.nextUrl.pathname.startsWith("/runner/logout")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/runner/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/runner/:path*", "/provider/:path*"],
};
