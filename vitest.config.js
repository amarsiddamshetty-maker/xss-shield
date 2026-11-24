import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['server/services/**/*.js', 'server/database/**/*.js', 'server/middleware/**/*.js', 'server/app.js', 'server/config.js', 'server/routes/**/*.js'],
      reporter: ['text', 'json-summary', 'html'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});
