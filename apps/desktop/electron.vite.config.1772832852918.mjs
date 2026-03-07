// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
var __electron_vite_injected_dirname = "C:\\Users\\lucas\\Documents\\teki\\apps\\desktop";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ["@teki/shared"] })],
    resolve: {
      alias: {
        "@teki/shared": resolve(__electron_vite_injected_dirname, "../../packages/shared")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ["@teki/shared"] })],
    resolve: {
      alias: {
        "@teki/shared": resolve(__electron_vite_injected_dirname, "../../packages/shared")
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/preload/index.ts"),
          "tray-popup": resolve(__electron_vite_injected_dirname, "src/preload/tray-popup.ts")
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src/renderer"),
        "@teki/shared": resolve(__electron_vite_injected_dirname, "../../packages/shared")
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/renderer/index.html"),
          "tray-popup": resolve(__electron_vite_injected_dirname, "src/renderer/tray-popup.html")
        }
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
