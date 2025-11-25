import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), mkcert()],
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
  server: {
    proxy: {},
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // https://rollupjs.org/guide/en/#outputmanualchunks
      output: {},
    },
  },
});