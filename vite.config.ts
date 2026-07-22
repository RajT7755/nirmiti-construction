import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const pagesBase =
  process.env.GITHUB_PAGES === "true" ? "/nirmiti-construction/" : "/";

export default defineConfig({
  base: pagesBase,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
