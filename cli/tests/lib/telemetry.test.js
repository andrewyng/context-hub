import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const originalEnv = {
  CHUB_DIR: process.env.CHUB_DIR,
  CHUB_TELEMETRY: process.env.CHUB_TELEMETRY,
  CHUB_FEEDBACK: process.env.CHUB_FEEDBACK,
  CHUB_TELEMETRY_URL: process.env.CHUB_TELEMETRY_URL,
};
let tempChubDir;

beforeAll(() => {
  tempChubDir = mkdtempSync(join(tmpdir(), 'chub-telemetry-test-'));
  process.env.CHUB_DIR = tempChubDir;
});

afterAll(() => {
  for (const [k, v] of Object.entries(originalEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  if (tempChubDir) rmSync(tempChubDir, { recursive: true, force: true });
});

beforeEach(() => {
  delete process.env.CHUB_TELEMETRY;
  delete process.env.CHUB_FEEDBACK;
  delete process.env.CHUB_TELEMETRY_URL;
  vi.resetModules();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function loadTelemetry() {
  return await import('../../src/lib/telemetry.js');
}

describe('isTelemetryEnabled', () => {
  it('returns true by default', async () => {
    const { isTelemetryEnabled } = await loadTelemetry();
    expect(isTelemetryEnabled()).toBe(true);
  });

  it('returns false when CHUB_TELEMETRY=0', async () => {
    process.env.CHUB_TELEMETRY = '0';
    const { isTelemetryEnabled } = await loadTelemetry();
    expect(isTelemetryEnabled()).toBe(false);
  });

  it('returns false when CHUB_TELEMETRY=false', async () => {
    process.env.CHUB_TELEMETRY = 'false';
    const { isTelemetryEnabled } = await loadTelemetry();
    expect(isTelemetryEnabled()).toBe(false);
  });

  it('returns true for any other CHUB_TELEMETRY value', async () => {
    process.env.CHUB_TELEMETRY = '1';
    const { isTelemetryEnabled } = await loadTelemetry();
    expect(isTelemetryEnabled()).toBe(true);
  });
});

describe('isFeedbackEnabled', () => {
  it('returns true by default', async () => {
    const { isFeedbackEnabled } = await loadTelemetry();
    expect(isFeedbackEnabled()).toBe(true);
  });

  it('returns false when CHUB_FEEDBACK=0', async () => {
    process.env.CHUB_FEEDBACK = '0';
    const { isFeedbackEnabled } = await loadTelemetry();
    expect(isFeedbackEnabled()).toBe(false);
  });

  it('returns false when CHUB_FEEDBACK=false', async () => {
    process.env.CHUB_FEEDBACK = 'false';
    const { isFeedbackEnabled } = await loadTelemetry();
    expect(isFeedbackEnabled()).toBe(false);
  });
});

describe('getTelemetryUrl', () => {
  it('returns the default URL when no env or config override', async () => {
    const { getTelemetryUrl } = await loadTelemetry();
    expect(getTelemetryUrl()).toBe('https://api.aichub.org/v1');
  });

  it('prefers CHUB_TELEMETRY_URL when set', async () => {
    process.env.CHUB_TELEMETRY_URL = 'https://example.test/v1';
    const { getTelemetryUrl } = await loadTelemetry();
    expect(getTelemetryUrl()).toBe('https://example.test/v1');
  });
});

describe('sendFeedback', () => {
  it('skips the request when feedback is disabled', async () => {
    process.env.CHUB_FEEDBACK = '0';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { sendFeedback } = await loadTelemetry();
    const result = await sendFeedback('acme/widgets', 'doc', 'up');
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('feedback_disabled');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns { status: "sent", feedback_id } on 200 OK with id', async () => {
    process.env.CHUB_TELEMETRY_URL = 'https://example.test/v1';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ feedback_id: 'abc-123' }),
    });
    const { sendFeedback } = await loadTelemetry();
    const result = await sendFeedback('acme/widgets', 'doc', 'up');
    expect(result.status).toBe('sent');
    expect(result.feedback_id).toBe('abc-123');
  });

  it('falls back to data.id when feedback_id is not present', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'fallback-id' }),
    });
    const { sendFeedback } = await loadTelemetry();
    const result = await sendFeedback('acme/widgets', 'doc', 'up');
    expect(result.feedback_id).toBe('fallback-id');
  });

  it('returns { status: "error", code } on non-OK HTTP response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const { sendFeedback } = await loadTelemetry();
    const result = await sendFeedback('acme/widgets', 'doc', 'down');
    expect(result.status).toBe('error');
    expect(result.code).toBe(500);
  });

  it('returns { status: "error", reason: "network" } on fetch throw', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    const { sendFeedback } = await loadTelemetry();
    const result = await sendFeedback('acme/widgets', 'doc', 'up');
    expect(result.status).toBe('error');
    expect(result.reason).toBe('network');
  });

  it('POSTs the expected JSON body to <url>/feedback', async () => {
    process.env.CHUB_TELEMETRY_URL = 'https://example.test/v1';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ feedback_id: 'x' }),
    });
    const { sendFeedback } = await loadTelemetry();
    await sendFeedback('acme/widgets', 'doc', 'up', {
      comment: 'great',
      docLang: 'python',
      docVersion: '2.0',
      labels: ['accurate'],
      cliVersion: '0.1.4',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://example.test/v1/feedback');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(opts.headers['X-Client-ID']).toMatch(/^[0-9a-f]{64}$/);
    const body = JSON.parse(opts.body);
    expect(body.entry_id).toBe('acme/widgets');
    expect(body.entry_type).toBe('doc');
    expect(body.rating).toBe('up');
    expect(body.comment).toBe('great');
    expect(body.doc_lang).toBe('python');
    expect(body.doc_version).toBe('2.0');
    expect(body.labels).toEqual(['accurate']);
    expect(body.cli_version).toBe('0.1.4');
  });

  it('aborts the request when the timeout fires', async () => {
    // Make fetch never resolve; the AbortController should trigger after FEEDBACK_FETCH_TIMEOUT_MS.
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url, opts) =>
        new Promise((_resolve, reject) => {
          opts.signal.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
          );
        }),
    );
    const { sendFeedback } = await loadTelemetry();
    const result = await sendFeedback('acme/widgets', 'doc', 'up');
    expect(result.status).toBe('error');
    expect(result.reason).toBe('network');
  }, 10000);
});
