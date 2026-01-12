import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM build: keep dynamic imports as real chunks so browser apps (Vite/Webpack/etc.)
  // don't evaluate Solana deps before we install browser polyfills.
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: true,
    outDir: 'dist',
  },
  // CJS build: esbuild doesn't support code-splitting for CJS output.
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: false,
    sourcemap: true,
    clean: false,
    treeshake: true,
    splitting: false,
    outDir: 'dist',
  },
]);
