import type { TekiAPI } from '@teki/shared';

declare global {
  interface Window {
    tekiAPI: TekiAPI;
  }
}
