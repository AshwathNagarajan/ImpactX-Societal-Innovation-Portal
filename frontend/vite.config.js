import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  envPrefix: ["VITE_", "API_"],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    hmr: false,
    headers: {
      "Cache-Control": "no-store",
    },
  },
});
