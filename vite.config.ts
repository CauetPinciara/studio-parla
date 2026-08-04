import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react-vendor", test: /node_modules\/(react|react-dom|react-router|react-router-dom)\// },
            { name: "supabase-vendor", test: /node_modules\/@supabase\// },
            { name: "query-vendor", test: /node_modules\/@tanstack\// },
            { name: "ui-vendor", test: /node_modules\/(@radix-ui|lucide-react|sonner)\// },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
