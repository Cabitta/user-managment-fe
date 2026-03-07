import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias @/ para que shadcn/ui pueda resolver sus imports internos
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
