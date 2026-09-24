import type { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

export const overlayDimensions = {
  width: 400,
  height: 140,
  maxHeight: 350
} as const;

export function createOverlayWindowOptions(preloadPath: string): BrowserWindowConstructorOptions {
  return {
    width: overlayDimensions.width,
    height: overlayDimensions.height,
    maxHeight: overlayDimensions.maxHeight,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: preloadPath
    }
  };
}

export interface OverlayWindowDependencies {
  createBrowserWindow: (options: BrowserWindowConstructorOptions) => BrowserWindow;
  loadRenderer: (window: BrowserWindow) => Promise<void>;
  preloadPath: string;
}

export class OverlayWindow {
  private window: BrowserWindow | undefined;

  public constructor(private readonly dependencies: OverlayWindowDependencies) {}

  public create(): BrowserWindow {
    if (this.window !== undefined && !this.window.isDestroyed()) {
      return this.window;
    }

    const window = this.dependencies.createBrowserWindow(
      createOverlayWindowOptions(this.dependencies.preloadPath)
    );

    this.window = window;
    window.on('closed', () => {
      if (this.window === window) {
        this.window = undefined;
      }
    });
    void this.dependencies.loadRenderer(window);

    return window;
  }

  public show(): void {
    this.create().show();
  }

  public hide(): void {
    if (this.window !== undefined && !this.window.isDestroyed()) {
      this.window.hide();
    }
  }

  public isVisible(): boolean {
    return this.window !== undefined && !this.window.isDestroyed() && this.window.isVisible();
  }

  public destroy(): void {
    if (this.window !== undefined && !this.window.isDestroyed()) {
      this.window.destroy();
    }

    this.window = undefined;
  }
}
