import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },
  resolve: {
    alias: {
      '~modules': resolve(__dirname, './src/modules'),
      '~shared': resolve(__dirname, './src/shared'),
      '~core': resolve(__dirname, './src/core'),
      '~lib': resolve(__dirname, './src/lib'),
    },
  },
  plugins: [swc.vite()],
});
