import type { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { describe, expect, it, vi } from 'vitest';
import { createOverlayWindowOptions, OverlayWindow, overlayDimensions } from './overlay-window.js';

class FakeBrowserWindow {
  private closedListener: (() => void) | undefined;
  private visible = false;
  private destroyed = false;

  public on(event: 'closed', listener: () => void): this {
    if (event === 'closed') {
      this.closedListener = listener;
    }

    return this;
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }

  public destroy(): void {
    this.destroyed = true;
    this.closedListener?.();
  }
}

describe('createOverlayWindowOptions', () => {
  it('configures a secure, compact, hidden overlay window', () => {
    const options = createOverlayWindowOptions('/app/preload/index.js');

    expect(options).toMatchObject({
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
        preload: '/app/preload/index.js'
      }
    });
  });
});

describe('OverlayWindow', () => {
  it('creates at most one window, supports visibility changes, and releases it on destroy', () => {
    const firstWindow = new FakeBrowserWindow();
    const secondWindow = new FakeBrowserWindow();
    const createBrowserWindow = vi
      .fn<(options: BrowserWindowConstructorOptions) => BrowserWindow>()
      .mockReturnValueOnce(firstWindow as unknown as BrowserWindow)
      .mockReturnValueOnce(secondWindow as unknown as BrowserWindow);
    const loadRenderer = vi.fn<(window: BrowserWindow) => Promise<void>>().mockResolvedValue();
    const overlayWindow = new OverlayWindow({
      createBrowserWindow,
      loadRenderer,
      preloadPath: '/app/preload/index.js'
    });

    overlayWindow.create();
    overlayWindow.create();

    expect(createBrowserWindow).toHaveBeenCalledTimes(1);
    expect(loadRenderer).toHaveBeenCalledTimes(1);
    expect(overlayWindow.isVisible()).toBe(false);

    overlayWindow.show();
    expect(overlayWindow.isVisible()).toBe(true);

    overlayWindow.hide();
    expect(overlayWindow.isVisible()).toBe(false);

    overlayWindow.destroy();
    expect(overlayWindow.isVisible()).toBe(false);

    overlayWindow.create();
    expect(createBrowserWindow).toHaveBeenCalledTimes(2);
  });
});
