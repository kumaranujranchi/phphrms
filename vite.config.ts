import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@components": path.resolve(__dirname, "./client/src/components"),
      "@pages": path.resolve(__dirname, "./client/src/pages"),
      "@hooks": path.resolve(__dirname, "./client/src/hooks"),
      "@lib": path.resolve(__dirname, "./client/src/lib"),
      "@utils": path.resolve(__dirname, "./client/src/utils"),
      "@styles": path.resolve(__dirname, "./client/src/styles"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  define: {
    __API_BASE_URL__: JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://yourdomain.com/api' // Replace with your actual Hostinger domain
        : 'http://localhost:3000/api'
    ),
  },
});
