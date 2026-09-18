import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.vue'],
      tsconfigPath: './tsconfig.json',
      entryRoot: 'src',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: './src/index.ts',
      },
      name: 'HlwUniVue',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        'pinia',
        '@hlw-mp/request-crypto',
        '@hlw-mp/core',
        /^@dcloudio\//,
        /^node:/,
      ],
    },
    copyPublicDir: false,
    minify: false,
  },
});
