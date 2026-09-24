import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { OverlayView } from './OverlayView';
import type { OverlayState } from './overlay-state';

const renderOverlay = (state: OverlayState): string =>
  renderToStaticMarkup(<OverlayView state={state} onCopy={vi.fn()} onClose={vi.fn()} />);

describe('OverlayView', () => {
  it('renders a compact status without controls while thinking', () => {
    const markup = renderOverlay({ status: 'THINKING' });

    expect(markup).toContain('Analyzing…');
    expect(markup).not.toContain('<button');
  });

  it('renders paragraphs, lists, inline code, and answer controls from Markdown', () => {
    const markup = renderOverlay({
      status: 'ANSWER',
      streamedText: 'A paragraph with `code`.\n\n- First\n- Second\n\n1. One\n2. Two'
    });

    expect(markup).toContain('<p>A paragraph with <code>code</code>.</p>');
    expect(markup).toContain('<ul>');
    expect(markup).toContain('<ol>');
    expect(markup).toContain('Copy');
    expect(markup).toContain('Close');
  });

  it('renders fenced code as a readable code block', () => {
    const markup = renderOverlay({
      status: 'ANSWER',
      streamedText: '```ts\nconst answer = 42;\n```'
    });

    expect(markup).toContain('<pre><code class="language-ts">');
    expect(markup).toContain('const answer = 42;');
  });

  it('renders a friendly error with only the close control', () => {
    const markup = renderOverlay({
      status: 'ERROR',
      errorMessage: 'Unable to analyze the screen.'
    });

    expect(markup).toContain('role="alert"');
    expect(markup).toContain('Unable to analyze the screen.');
    expect(markup).toContain('Close');
    expect(markup).not.toContain('Copy');
  });

  it('renders nothing for the hidden state', () => {
    expect(renderOverlay({ status: 'HIDDEN' })).toBe('');
  });
});
