import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    ssr: true,
    target: "node18", // node22 also fine
    outDir: "dist/server",
    rollupOptions: {
      input: path.resolve(__dirname, "server/index.ts"), // 👈 this is your real entry
      output: {
        entryFileNames: "node-build.mjs", // 👈 Netlify will use this file
        format: "esm",
      },
      external: [
        // Node built-ins
        "fs", "path", "url", "http", "https", "os", "crypto",
        "stream", "util", "events", "buffer", "querystring", "child_process",
        // External dependencies
        "express", "cors",
      ],
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
