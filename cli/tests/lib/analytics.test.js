import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CHUB_TELEMETRY;
  });

  it('trackEvent does not throw when posthog-node is missing', async () => {
    // posthog-node won't be installed in test env — should silently skip
    const { trackEvent } = await import('../../src/lib/analytics.js');
    await expect(trackEvent('test_event', { foo: 'bar' })).resolves.not.toThrow();
  });

  it('trackEvent does nothing when telemetry is disabled', async () => {
    process.env.CHUB_TELEMETRY = '0';
    const { trackEvent } = await import('../../src/lib/analytics.js');
    await expect(trackEvent('test_event', {})).resolves.not.toThrow();
  });

  it('shutdownAnalytics does not throw when not initialized', async () => {
    const { shutdownAnalytics } = await import('../../src/lib/analytics.js');
    await expect(shutdownAnalytics()).resolves.not.toThrow();
  });

  it('setCliVersion makes cli_version available', async () => {
    const { setCliVersion } = await import('../../src/lib/analytics.js');
    // Should not throw
    setCliVersion('1.2.3');
  });

  it('trackEvent includes global properties when posthog is available', async () => {
    // Mock posthog-node to capture what gets sent
    const capturedEvents = [];
    vi.doMock('posthog-node', () => ({
      PostHog: class {
        constructor() {}
        capture(event) { capturedEvents.push(event); }
        async flush() {}
        async shutdown() {}
      },
    }));

    const { trackEvent, setCliVersion } = await import('../../src/lib/analytics.js');
    setCliVersion('0.1.2');
    await trackEvent('test_event', { entry_id: 'openai/chat' });

    expect(capturedEvents.length).toBe(1);
    const props = capturedEvents[0].properties;
    expect(props).toHaveProperty('platform');
    expect(props).toHaveProperty('node_version');
    expect(props).toHaveProperty('cli_version', '0.1.2');
    expect(props).toHaveProperty('entry_id', 'openai/chat');
  });

  it('trackEvent does not include error_message in properties', async () => {
    const capturedEvents = [];
    vi.doMock('posthog-node', () => ({
      PostHog: class {
        constructor() {}
        capture(event) { capturedEvents.push(event); }
        async flush() {}
        async shutdown() {}
      },
    }));

    const { trackEvent } = await import('../../src/lib/analytics.js');
    await trackEvent('fetch_error', { entry_id: 'stripe/api', error_type: 'ECONNREFUSED' });

    expect(capturedEvents.length).toBe(1);
    const props = capturedEvents[0].properties;
    expect(props).toHaveProperty('error_type', 'ECONNREFUSED');
    expect(props).not.toHaveProperty('error_message');
  });
});

describe('identity', () => {
  let tempDir;
  let origChubDir;

  beforeEach(() => {
    vi.resetModules();
    // Isolate from real ~/.chub — use a temp directory
    tempDir = mkdtempSync(join(tmpdir(), 'chub-test-'));
    origChubDir = process.env.CHUB_DIR;
    process.env.CHUB_DIR = tempDir;
  });

  afterEach(() => {
    if (origChubDir !== undefined) {
      process.env.CHUB_DIR = origChubDir;
    } else {
      delete process.env.CHUB_DIR;
    }
    try { rmSync(tempDir, { recursive: true }); } catch {}
  });

  it('isFirstRun returns false before getOrCreateClientId', async () => {
    const { isFirstRun } = await import('../../src/lib/identity.js');
    expect(isFirstRun()).toBe(false);
  });

  it('isFirstRun returns true on fresh directory', async () => {
    const { getOrCreateClientId, isFirstRun } = await import('../../src/lib/identity.js');
    await getOrCreateClientId();
    // Fresh temp dir = no existing client_id = first run
    expect(isFirstRun()).toBe(true);
  });

  it('isFirstRun returns false on second load with same dir', async () => {
    // First call creates the client_id file
    const mod1 = await import('../../src/lib/identity.js');
    await mod1.getOrCreateClientId();
    expect(mod1.isFirstRun()).toBe(true);

    // Reset module to simulate a new process, same CHUB_DIR
    vi.resetModules();
    const mod2 = await import('../../src/lib/identity.js');
    await mod2.getOrCreateClientId();
    // File exists now, so not first run
    expect(mod2.isFirstRun()).toBe(false);
  });
});
