import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { attachStdioShutdownHandlers } from '../../src/mcp/stdio-lifecycle.js';

function makeStream() {
  const stream = new EventEmitter();
  stream.resume = vi.fn();
  return stream;
}

describe('attachStdioShutdownHandlers', () => {
  it('exits on stdin end', () => {
    const stdin = makeStream();
    const stdout = makeStream();
    const stderr = { write: vi.fn() };
    const onShutdown = vi.fn();

    attachStdioShutdownHandlers({ stdin, stdout, stderr, onShutdown });
    stdin.emit('end');

    expect(onShutdown).toHaveBeenCalledTimes(1);
    expect(onShutdown).toHaveBeenCalledWith(0);
    expect(stderr.write).toHaveBeenCalledWith('[chub-mcp] Stdin closed; exiting.\n');
  });

  it('exits on stdout EPIPE', () => {
    const stdin = makeStream();
    const stdout = makeStream();
    const stderr = { write: vi.fn() };
    const onShutdown = vi.fn();

    attachStdioShutdownHandlers({ stdin, stdout, stderr, onShutdown });
    stdout.emit('error', { code: 'EPIPE' });

    expect(onShutdown).toHaveBeenCalledTimes(1);
    expect(stderr.write).toHaveBeenCalledWith('[chub-mcp] Stdout pipe closed (EPIPE); exiting.\n');
  });

  it('ignores non-EPIPE stdout errors', () => {
    const stdin = makeStream();
    const stdout = makeStream();
    const stderr = { write: vi.fn() };
    const onShutdown = vi.fn();

    attachStdioShutdownHandlers({ stdin, stdout, stderr, onShutdown });
    stdout.emit('error', { code: 'ECONNRESET' });

    expect(onShutdown).not.toHaveBeenCalled();
    expect(stderr.write).not.toHaveBeenCalled();
  });

  it('only shuts down once', () => {
    const stdin = makeStream();
    const stdout = makeStream();
    const stderr = { write: vi.fn() };
    const onShutdown = vi.fn();

    attachStdioShutdownHandlers({ stdin, stdout, stderr, onShutdown });
    stdin.emit('end');
    stdout.emit('error', { code: 'EPIPE' });
    stdin.emit('close');

    expect(onShutdown).toHaveBeenCalledTimes(1);
    expect(stderr.write).toHaveBeenCalledTimes(1);
  });

  it('returns cleanup function that removes listeners', () => {
    const stdin = makeStream();
    const stdout = makeStream();
    const stderr = { write: vi.fn() };
    const onShutdown = vi.fn();

    const cleanup = attachStdioShutdownHandlers({ stdin, stdout, stderr, onShutdown });
    cleanup();

    expect(stdin.listenerCount('end')).toBe(0);
    expect(stdin.listenerCount('close')).toBe(0);
    expect(stdin.listenerCount('error')).toBe(0);
    expect(stdout.listenerCount('error')).toBe(0);
    expect(onShutdown).not.toHaveBeenCalled();
  });

  it('resumes stdin so EOF can be observed', () => {
    const stdin = makeStream();
    const stdout = makeStream();

    attachStdioShutdownHandlers({
      stdin,
      stdout,
      stderr: { write: vi.fn() },
      onShutdown: vi.fn(),
    });

    expect(stdin.resume).toHaveBeenCalledTimes(1);
  });
});
