import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18nRouting = createMiddleware({
  locales: ["it", "en", "es", "de", "fr"],
  defaultLocale: "it",
  localePrefix: "never",
});

export async function middleware(request: NextRequest) {
  const i18nResponse = handleI18nRouting(request);
  return updateSession(request, i18nResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ads.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
