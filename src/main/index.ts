import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV === 'development';

function createApplicationWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(currentDirectory, '../preload/index.js')
    }
  });

  if (isDevelopment) {
    void window.loadURL('http://127.0.0.1:5173');
  } else {
    void window.loadFile(path.join(currentDirectory, '../renderer/index.html'));
  }

  return window;
}

app.whenReady().then(() => {
  createApplicationWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createApplicationWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
