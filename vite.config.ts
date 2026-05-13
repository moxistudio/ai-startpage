import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, "newtab.html"),
        "ai-handoff": resolve(__dirname, "src-content/ai-handoff.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "ai-handoff") return "ai-handoff.js";
          return "assets/[name]-[hash].js";
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name ?? "";
          if (info.endsWith(".css")) return "assets/[name]-[hash][extname]";
          if (/\.(woff2?|ttf|otf)$/.test(info)) return "assets/fonts/[name][extname]";
          if (/\.(png|jpe?g|gif|svg|ico)$/.test(info)) return "assets/images/[name][extname]";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "src/styles/variables" as *;`,
      },
    },
  },
  publicDir: "public",
});
