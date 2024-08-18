// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { defineConfig, loadEnv } from "vite";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import vue from "@vitejs/plugin-vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dynamicImport from "vite-plugin-dynamic-import";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as path from "path";

process.env = { ...process.env, ...loadEnv("", process.cwd()) };

export default defineConfig({
  server: { port: 8080 },
  plugins: [vue(), dynamicImport()],
  resolve: {
    alias: [
      {
        find: "@",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  define: {
    "process.env": process.env,
  },
  build: {
    outDir: "dist",
    assetsDir: ".",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "[name].[hash].js",
        assetFileNames: "[name].[hash].[ext]",
      },
    },
  },
  base: "/notreallycorrect/",
});
