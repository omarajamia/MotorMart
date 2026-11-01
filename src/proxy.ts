import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/supabase";

// Keeps the session fresh and sends signed-out visitors to the login page of
// the admin or shop area. This is only a convenience: every page and action
// checks the user again, and the database policies protect the data.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /admin is for the MotorMart team, /shop for shop owners. Each area has
  // its own login page; the pages send accounts to the right area.
  const area = request.nextUrl.pathname.startsWith("/shop") ? "/shop" : "/admin";
  const loginPage = `${area}/login`;
  const isLoginPage = request.nextUrl.pathname === loginPage;

  if (!user && !isLoginPage) {
    return redirectWithCookies(request, response, loginPage);
  }
  if (user && isLoginPage) {
    return redirectWithCookies(request, response, area);
  }

  return response;
}

function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string
) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/shop", "/shop/:path*"],
};
