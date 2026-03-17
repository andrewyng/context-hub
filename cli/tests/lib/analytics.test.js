import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

  it('trackEvent resolves quickly even if flush is slow', async () => {
    vi.doMock('../../src/lib/telemetry.js', () => ({
      isTelemetryEnabled: () => true,
    }));
    vi.doMock('../../src/lib/identity.js', () => ({
      getOrCreateClientId: async () => 'test-client-id',
    }));

    let flushCalled = false;
    vi.doMock('posthog-node', () => ({
      PostHog: class {
        capture() {}
        flush() {
          flushCalled = true;
          return new Promise(() => {});
        }
        shutdown() {
          return Promise.resolve();
        }
      },
    }));

    const { trackEvent } = await import('../../src/lib/analytics.js');

    const resolved = await Promise.race([
      trackEvent('test_event', {}).then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), 25)),
    ]);

    expect(flushCalled).toBe(true);
    expect(resolved).toBe(true);
  });
});
