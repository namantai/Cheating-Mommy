import { describe, expect, it } from 'vitest';
import { applicationName } from './app-info.js';

describe('applicationName', () => {
  it('identifies the application in shared code', () => {
    expect(applicationName).toBe('Arch AI Overlay');
  });
});
