import { contextBridge, ipcRenderer } from 'electron';
import { overlayIpcChannels, type OverlayApi } from '../shared/ipc/overlay.js';

const overlayApi: OverlayApi = {
  hide: () => ipcRenderer.send(overlayIpcChannels.hide)
};

contextBridge.exposeInMainWorld('overlay', overlayApi);
