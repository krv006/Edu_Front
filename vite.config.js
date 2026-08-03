import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "https://edu.thesofmebel.uz",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
