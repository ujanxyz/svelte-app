import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  // assetsInclude: ['**/*.wasm'],
  base: "./", // This ensures assets are linked relatively
  server: {
    port: 3000,
  },
});
