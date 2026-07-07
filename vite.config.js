import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    css: false,
    optimizeDeps: {
      include: ["@testing-library/react", "@testing-library/jest-dom", "react-hook-form", "zod"],
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/main.jsx",
        "src/test/**",
        "src/**/*.test.*",
        "src/**/*.spec.*",
        "src/styles/**",
        "src/**/*.css",
        "tests/**",
        "playwright.config.js",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
