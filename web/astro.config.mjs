import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

export default defineConfig({
  site: process.env.SITE_URL || "https://www.mikesconeyisland.com",
  adapter: node({ mode: "standalone" }),
  security: { checkOrigin: false },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
