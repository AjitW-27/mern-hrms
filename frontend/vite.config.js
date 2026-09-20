import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_DEV_API_TARGET || "http://localhost:5000";

  return {
    plugins: [react()],

    // MUI v5 uses Emotion as its default styled engine. Vite's dependency
    // optimizer can occasionally resolve Emotion's CJS/ESM entry points
    // inconsistently and produce: "styled_default is not a function".
    // Keep the Emotion/MUI styling stack in one optimized dependency graph.
    optimizeDeps: {
      include: [
        "@emotion/react",
        "@emotion/styled",
        "@mui/material",
        "@mui/system",
        "@mui/styled-engine",
        "@mui/material/Tooltip",
      ],
      exclude: ["@mui/styled-engine-sc", "styled-components"],
    },

    resolve: {
      dedupe: ["react", "react-dom", "@emotion/react", "@emotion/styled"],
    },

    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": { target, changeOrigin: true, secure: false },
        "/socket.io": { target, changeOrigin: true, ws: true, secure: false },
      },
    },
  };
});
