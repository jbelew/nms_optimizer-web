import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./e2e-tests/**/*.test.js'],
    environment: 'node',
    setupFiles: ['./e2e-tests/vitest.setup.js'],
  },
});