import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://www.0xkholod.com",
  output: "static",
  vite: {
    server: {
      proxy: {
        "/manual-index": {
          target: "https://docs.0xkholod.com",
          changeOrigin: true,
          rewrite: () => "/static/contentIndex.json",
        },
      },
    },
    build: {
      target: "es2022",
    },
  },
})
