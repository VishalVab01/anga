import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "mobile",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "../dist-mobile",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "mobile/index.html"),
      },
    },
  },
});
