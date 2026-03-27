/**
 * PostHog Cloud analytics for general CLI usage tracking.
 *
 * Tracks: command usage, search patterns, doc/skill popularity, errors.
 * Does NOT track feedback ratings (those go to the custom API via telemetry.js).
 *
 * Respects telemetry opt-out: `telemetry: false` in config or CHUB_TELEMETRY=0.
 * Feedback has a separate opt-out: `feedback: false` in config or CHUB_FEEDBACK=0.
 */

import { isTelemetryEnabled } from './telemetry.js';

// PostHog project API key (public — standard for client-side analytics)
const POSTHOG_KEY = 'phc_tO9mXIgcCuBccfN2Ut0quf6UFsd06u3Y6g1kqMaYdQX';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let _posthog = null;
let _initFailed = false;

/**
 * Lazily initialize PostHog client. Returns null if telemetry is disabled
 * or posthog-node is not installed.
 */
async function getClient() {
  if (_initFailed) return null;
  if (_posthog) return _posthog;

  if (!isTelemetryEnabled()) {
    _initFailed = true;
    return null;
  }

  try {
    const { PostHog } = await import('posthog-node');
    _posthog = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      flushAt: 1,        // Send immediately (CLI is short-lived)
      flushInterval: 0,  // Don't batch
    });
    return _posthog;
  } catch {
    // posthog-node not installed — skip analytics silently
    _initFailed = true;
    return null;
  }
}

/**
 * Track an analytics event. Fire-and-forget — never throws, never blocks.
 *
 * @param {string} event - Event name (e.g., 'command_run', 'search', 'doc_fetched')
 * @param {object} properties - Event properties
 */
export async function trackEvent(event, properties = {}) {
  try {
    const client = await getClient();
    if (!client) return;

    const { getOrCreateClientId } = await import('./identity.js');
    const distinctId = await getOrCreateClientId();

    client.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        platform: process.platform,
        node_version: process.version,
        cli_version: _cliVersion || undefined,
      },
    });

    // Flush immediately since CLI process exits soon
    await client.flush();
  } catch {
    // Silent fail — analytics should never disrupt CLI
  }
}

let _cliVersion;
/**
 * Set the CLI version for inclusion in all events.
 * Called once from index.js at startup.
 */
export function setCliVersion(version) {
  _cliVersion = version;
}

/**
 * Shut down the PostHog client gracefully.
 * Call this before process exit if possible.
 */
export async function shutdownAnalytics() {
  if (_posthog) {
    try {
      await _posthog.shutdown();
    } catch {
      // Silent
    }
  }
}
