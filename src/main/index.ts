import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { overlayIpcChannels } from '../shared/ipc/overlay.js';
import { OverlayWindow } from './window/overlay-window.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV === 'development';

const overlayWindow = new OverlayWindow({
  createBrowserWindow: (options) => new BrowserWindow(options),
  loadRenderer: (window) => {
    if (isDevelopment) {
      return window.loadURL('http://127.0.0.1:5173');
    }

    return window.loadFile(path.join(currentDirectory, '../renderer/index.html'));
  },
  preloadPath: path.join(currentDirectory, '../preload/index.cjs')
});

ipcMain.on(overlayIpcChannels.hide, () => {
  overlayWindow.hide();
});

app.whenReady().then(() => {
  overlayWindow.create();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      overlayWindow.create();
    }
  });
});

app.on('before-quit', () => {
  overlayWindow.destroy();
});

app.on('window-all-closed', () => {
  app.quit();
});
