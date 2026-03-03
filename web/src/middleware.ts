import { defineMiddleware } from "astro:middleware";

const SITE_MODE = process.env.SITE_MODE || "live";
const API_URL = process.env.API_URL || "http://localhost:3000";
const SITE_PASSWORD = process.env.SITE_PASSWORD || "";

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

    // Simple password gate for test/preview sites
    if (SITE_PASSWORD) {
      const isPassthrough = PASSTHROUGH_PREFIXES.some((p) => path.startsWith(p));
      if (!isPassthrough) {
        const cookies = request.headers.get("cookie") || "";
        const hasAuth = cookies.includes("site_access=granted");

        if (!hasAuth) {
          // Check if password submitted via query param
          const pw = url.searchParams.get("pw");
          if (pw === SITE_PASSWORD) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: url.pathname,
                "Set-Cookie": "site_access=granted; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800",
              },
            });
          }

          // Show password form
          return new Response(
            `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Password Required</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f1419;color:#e5e7eb;font-family:system-ui,sans-serif}
.card{text-align:center;padding:2rem}.card h1{font-size:1.5rem;margin-bottom:.5rem;color:#fff}.card p{font-size:.875rem;color:#9ca3af;margin-bottom:1.5rem}
form{display:flex;gap:.5rem;justify-content:center}input{padding:.5rem 1rem;border-radius:.375rem;border:1px solid #374151;background:#1f2937;color:#fff;font-size:.875rem}
input:focus{outline:none;border-color:#6366f1}button{padding:.5rem 1.25rem;border-radius:.375rem;border:none;background:#6366f1;color:#fff;font-size:.875rem;cursor:pointer}
button:hover{background:#4f46e5}.err{color:#f87171;font-size:.75rem;margin-top:.75rem}</style></head>
<body><div class="card"><h1>Mike's Coney Island</h1><p>This site is password protected.</p>
<form method="get"><input type="password" name="pw" placeholder="Enter password" autofocus><button type="submit">Enter</button></form>
${pw !== null ? '<p class="err">Incorrect password</p>' : ''}</div></body></html>`,
            { status: 401, headers: { "Content-Type": "text/html" } }
          );
        }
      }
    }
  }

  return next();
});
