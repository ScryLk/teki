import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['@teki/shared'] })],
    resolve: {
      alias: {
        '@teki/shared': resolve(__dirname, '../../packages/shared'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@teki/shared'] })],
    resolve: {
      alias: {
        '@teki/shared': resolve(__dirname, '../../packages/shared'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
          'tray-popup': resolve(__dirname, 'src/preload/tray-popup.ts'),
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer'),
        '@teki/shared': resolve(__dirname, '../../packages/shared'),
      },
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          'tray-popup': resolve(__dirname, 'src/renderer/tray-popup.html'),
        },
      },
    },
  },
});
