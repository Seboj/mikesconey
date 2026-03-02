import { defineMiddleware } from "astro:middleware";

const SITE_MODE = process.env.SITE_MODE || "live";

const PASSTHROUGH_PREFIXES = ["/admin", "/api", "/_astro", "/_image"];

export const onRequest = defineMiddleware(({ url, redirect }, next) => {
  const path = url.pathname;

  if (SITE_MODE === "coming_soon") {
    // Allow passthrough paths and the coming-soon page itself
    const isPassthrough =
      path === "/coming-soon" ||
      path === "/coming-soon/" ||
      PASSTHROUGH_PREFIXES.some((p) => path.startsWith(p));

    if (!isPassthrough) {
      return redirect("/coming-soon", 302);
    }
  }

  if (SITE_MODE === "live") {
    // Redirect /coming-soon back to home when site is live
    if (path === "/coming-soon" || path === "/coming-soon/") {
      return redirect("/", 302);
    }
  }

  return next();
});
