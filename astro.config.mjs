import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

const base = process.env.BASE_PATH || "/";
if (process.env.CI && !process.env.SITE_URL) {
  throw new Error("SITE_URL is required for CI builds so canonical and social URLs cannot silently disappear.");
}

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL,
  base,
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
  },
});
