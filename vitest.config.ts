import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    tsconfig: './tsconfig.vitest.json',
    include: ['src/**/*.test.{ts,tsx}'],
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
      },
    },
    css: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  deps: {
    interopDefault: true,
  },
  plugins: [
    {
      name: 'mock-css',
      enforce: 'pre', // Ensure this plugin runs before others
      resolveId(source) {
        if (source.endsWith('.css')) {
          return '\0virtual-css'; // Return a virtual module ID
        }
        return null;
      },
      load(id) {
        if (id === '\0virtual-css') {
          return 'export default {};'; // Provide an empty module
        }
        return null;
      },
    },
  ],
});
