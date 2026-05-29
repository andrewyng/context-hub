import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

// Mock all dependencies before importing the module under test
vi.mock('../../src/lib/registry.js', () => ({
  getEntry: vi.fn(() => ({ entry: null })),
}));
vi.mock('../../src/lib/telemetry.js', () => ({
  sendFeedback: vi.fn(() => Promise.resolve({ status: 'sent', feedback_id: 'abc' })),
  isFeedbackEnabled: vi.fn(() => true),
  isTelemetryEnabled: vi.fn(() => true),
  getTelemetryUrl: vi.fn(() => 'https://example.test'),
}));
vi.mock('../../src/lib/identity.js', () => ({
  getOrCreateClientId: vi.fn(() => Promise.resolve('client-1234')),
}));
vi.mock('../../src/lib/output.js', () => ({
  output: vi.fn((data, formatter, opts) => {
    if (opts?.json) console.log(JSON.stringify(data));
    else formatter(data);
  }),
  error: vi.fn((msg, opts) => {
    if (opts?.json) console.log(JSON.stringify({ error: msg }));
    else process.stderr.write(`Error: ${msg}\n`);
    throw new Error(`__exit__:${msg}`);
  }),
}));
vi.mock('../../src/lib/analytics.js', () => ({
  trackEvent: vi.fn(() => Promise.resolve()),
}));

const { sendFeedback } = await import('../../src/lib/telemetry.js');
const { error } = await import('../../src/lib/output.js');
const { registerFeedbackCommand } = await import('../../src/commands/feedback.js');

async function runFeedback(args = []) {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'JSON output');
  registerFeedbackCommand(program);
  try {
    await program.parseAsync(['node', 'test', 'feedback', ...args]);
  } catch (err) {
    if (!String(err.message).startsWith('__exit__:')) throw err;
  }
}

describe('feedback command — label validation', () => {
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it('accepts valid labels and forwards them to sendFeedback', async () => {
    await runFeedback(['acme/widgets', 'up', '--label', 'accurate', '--label', 'helpful']);
    expect(sendFeedback).toHaveBeenCalledWith(
      'acme/widgets', expect.any(String), 'up',
      expect.objectContaining({ labels: ['accurate', 'helpful'] }),
    );
  });

  it('rejects a single invalid label with an actionable error', async () => {
    await runFeedback(['acme/widgets', 'up', '--label', 'outadted']);
    expect(error).toHaveBeenCalled();
    const msg = error.mock.calls[0][0];
    expect(msg).toMatch(/Invalid label: outadted/);
    expect(msg).toMatch(/Valid labels:.*outdated/);
    expect(sendFeedback).not.toHaveBeenCalled();
  });

  it('rejects multiple invalid labels and lists them all', async () => {
    await runFeedback(['acme/widgets', 'up', '--label', 'foo', '--label', 'bar']);
    expect(error).toHaveBeenCalled();
    const msg = error.mock.calls[0][0];
    expect(msg).toMatch(/Invalid labels: foo, bar/);
    expect(sendFeedback).not.toHaveBeenCalled();
  });

  it('rejects when one of several labels is invalid', async () => {
    await runFeedback(['acme/widgets', 'up', '--label', 'accurate', '--label', 'typoo']);
    expect(error).toHaveBeenCalled();
    expect(error.mock.calls[0][0]).toMatch(/Invalid label: typoo/);
    expect(sendFeedback).not.toHaveBeenCalled();
  });

  it('normalizes case before checking validity', async () => {
    await runFeedback(['acme/widgets', 'up', '--label', 'ACCURATE']);
    expect(error).not.toHaveBeenCalled();
    expect(sendFeedback).toHaveBeenCalledWith(
      expect.anything(), expect.anything(), 'up',
      expect.objectContaining({ labels: ['accurate'] }),
    );
  });

  it('passes through when no labels are given', async () => {
    await runFeedback(['acme/widgets', 'up']);
    expect(error).not.toHaveBeenCalled();
    expect(sendFeedback).toHaveBeenCalledWith(
      expect.anything(), expect.anything(), 'up',
      expect.objectContaining({ labels: undefined }),
    );
  });
});
