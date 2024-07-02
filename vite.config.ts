import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dynamicImport from "vite-plugin-dynamic-import";
import * as path from "path";

export default defineConfig({
  plugins: [vue(), dynamicImport()],
  server: { port: 8080 },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  build: {
    modulePreload: false,
    manifest: true,
    rollupOptions: {
      output: {
        chunkFileNames: () => `assets/[name].[hash].js`,
        entryFileNames: () => `[name].[hash].js`,
        assetFileNames: () => `[name].[hash].[ext]`,
      },
    },
  },
  base: "/notreallycorrect/",
});
