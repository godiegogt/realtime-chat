import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,          // ✅ describe/it/expect global
    fileParallelism: false, // ✅ no pisa DB
    pool: "forks",
    sequence: { shuffle: false }
  }
});