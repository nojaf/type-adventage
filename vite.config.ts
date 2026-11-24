import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * GitHub Pages serves project sites from /<repo>/, so the build needs a base
 * path. CI passes it in; local dev and user/org sites fall back to root.
 */
const base: string = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icon-180.png"],
      manifest: {
        name: "Type Advantage",
        short_name: "Type Adv",
        description:
          "Pick a Pokemon type, yours or your opponent's, and see instantly what beats what.",
        id: base,
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        background_color: "#0e1116",
        theme_color: "#0e1116",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: `${base}index.html`,
      },
      devOptions: { enabled: false },
    }),
  ],
});
