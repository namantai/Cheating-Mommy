export const overlayIpcChannels = {
  hide: 'overlay:hide'
} as const;

export interface OverlayApi {
  hide(): void;
}
