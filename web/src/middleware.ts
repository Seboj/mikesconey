import { defineMiddleware } from "astro:middleware";

const SITE_MODE = process.env.SITE_MODE || "live";
const API_URL = process.env.API_URL || "http://localhost:3000";

const PASSTHROUGH_PREFIXES = ["/admin", "/api", "/_astro", "/_image"];

export const onRequest = defineMiddleware(async ({ url, request, redirect }, next) => {
  const path = url.pathname;

  // Proxy /api/* requests to the API server (replaces Vite dev proxy in production)
  if (path.startsWith("/api/")) {
    const target = `${API_URL}${path}${url.search}`;
    const headers = new Headers(request.headers);
    headers.set("host", new URL(API_URL).host);

    const proxyRes = await fetch(target, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      // @ts-expect-error -- duplex required for streaming request bodies
      duplex: request.body ? "half" : undefined,
    });

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      statusText: proxyRes.statusText,
      headers: proxyRes.headers,
    });
  }

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
