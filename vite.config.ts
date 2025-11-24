import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.BASE_PATH,
  build: {
    chunkSizeWarningLimit: 600,
  },
});
