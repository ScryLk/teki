import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

// Ensure ELECTRON_RUN_AS_NODE is not inherited from parent (e.g. VS Code terminal).
// This env var forces Electron to run in Node.js mode, which prevents the built-in
// 'electron' module (app, BrowserWindow, etc.) from being available.
delete process.env.ELECTRON_RUN_AS_NODE;

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ['@teki/shared', '@whiskeysockets/baileys'] }),
    ],
    resolve: {
      alias: {
        '@teki/shared': resolve(__dirname, '../../packages/shared'),
      },
    },
    build: {
      rollupOptions: {
        external: ['bufferutil', 'utf-8-validate', 'better-sqlite3', 'pg', 'pg-native', 'pdf-parse', 'mammoth', 'ws'],
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
          floating: resolve(__dirname, 'src/preload/floating.ts'),
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
          floating: resolve(__dirname, 'src/renderer/floating.html'),
        },
      },
    },
  },
});
