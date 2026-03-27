import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { showWelcomeIfNeeded } from '../../src/lib/welcome.js';

const TEST_DIR = join('/tmp', 'test-chub');

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('../../src/lib/config.js', async () => {
  const { join } = await import('node:path');
  return { getChubDir: () => join('/tmp', 'test-chub') };
});

describe('showWelcomeIfNeeded', () => {
  let consoleSpy;
  let stdoutDescriptor;
  let stderrDescriptor;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
    stdoutDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
    stderrDescriptor = Object.getOwnPropertyDescriptor(process.stderr, 'isTTY');
    Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    Object.defineProperty(process.stderr, 'isTTY', { value: true, configurable: true });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    if (stdoutDescriptor) {
      Object.defineProperty(process.stdout, 'isTTY', stdoutDescriptor);
    }
    if (stderrDescriptor) {
      Object.defineProperty(process.stderr, 'isTTY', stderrDescriptor);
    }
  });

  it('shows welcome message on first run', () => {
    existsSync.mockReturnValue(false);

    showWelcomeIfNeeded();

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const output = consoleSpy.mock.calls[0][0];
    expect(output).toContain('Welcome to Context Hub (chub)!');
    expect(output).toContain('Terms of Service');
    expect(output).toContain('feedback: false');
    expect(output).toContain(join(TEST_DIR, 'config.yaml'));
  });

  it('creates marker file after showing message', () => {
    existsSync.mockReturnValue(false);

    showWelcomeIfNeeded();

    // Called twice: once for marker check, once for dir check
    expect(existsSync).toHaveBeenCalledTimes(2);
    expect(mkdirSync).toHaveBeenCalledWith(TEST_DIR, { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(
      join(TEST_DIR, '.welcome_shown'),
      expect.any(String),
      'utf8'
    );
  });

  it('does not show message if marker exists', () => {
    existsSync.mockReturnValueOnce(true); // marker exists

    showWelcomeIfNeeded();

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it('does not throw if marker write fails', () => {
    existsSync.mockReturnValue(false);
    writeFileSync.mockImplementation(() => { throw new Error('EACCES'); });

    expect(() => showWelcomeIfNeeded()).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it('does not show message in JSON mode', () => {
    showWelcomeIfNeeded({ json: true });

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it('does not show message when stdout is not a TTY', () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });

    showWelcomeIfNeeded();

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });
});
