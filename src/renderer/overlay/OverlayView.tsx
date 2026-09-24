import ReactMarkdown from 'react-markdown';
import type { OverlayState } from './overlay-state';

export interface OverlayViewProps {
  state: OverlayState;
  onCopy: (text: string) => void;
  onClose: () => void;
}

export function OverlayView({ state, onCopy, onClose }: OverlayViewProps) {
  if (state.status === 'HIDDEN') {
    return null;
  }

  if (state.status === 'THINKING') {
    return (
      <main className="overlay-surface overlay-surface--thinking" aria-live="polite">
        <span className="thinking-indicator" aria-hidden="true" />
        <span>Analyzing…</span>
      </main>
    );
  }

  if (state.status === 'ERROR') {
    return (
      <main className="overlay-surface">
        <p className="error-message" role="alert">
          {state.errorMessage}
        </p>
        <footer className="overlay-actions">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </footer>
      </main>
    );
  }

  return (
    <main className="overlay-surface">
      <article className="answer-content">
        <ReactMarkdown skipHtml>{state.streamedText}</ReactMarkdown>
      </article>
      <footer className="overlay-actions">
        <button type="button" onClick={() => onCopy(state.streamedText)}>
          Copy
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </footer>
    </main>
  );
}
