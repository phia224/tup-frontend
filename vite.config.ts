import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  preview: {
    host: true,
    port: 4000,
    allowedHosts: ["tupqualisys.online"],
  },
});
