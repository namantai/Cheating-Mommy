import type { OverlayApi } from '../shared/ipc/overlay';

declare global {
  interface Window {
    overlay: OverlayApi;
  }
}

export {};
