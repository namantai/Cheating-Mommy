import { useState } from 'react';
import { OverlayView } from './overlay/OverlayView';
import type { OverlayState } from './overlay/overlay-state';

const copyThroughFutureClipboardWorkflow = (): void => undefined;

export function App() {
  const [state] = useState<OverlayState>({ status: 'HIDDEN' });

  return (
    <OverlayView
      state={state}
      onCopy={copyThroughFutureClipboardWorkflow}
      onClose={() => window.overlay.hide()}
    />
  );
}
