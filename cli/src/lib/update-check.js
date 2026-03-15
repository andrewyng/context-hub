/**
 * Update-notifier check — fire-and-forget, never throws.
 *
 * Follows the same pattern as analytics.js:
 *  - Lazy dynamic import (no cost if skipped)
 *  - Silent on failure
 *  - Suppressed in --json mode
 *  - Opt-out via CHUB_UPDATE_CHECK=0
 *
 * Check interval: default 24 hours (managed by update-notifier internally).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Check for updates and display a notification if one is available.
 * Does nothing in --json mode or when CHUB_UPDATE_CHECK=0.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.json] - Whether --json flag is active
 * @param {Function} [opts._importNotifier] - For testing: injected import function
 */
export async function checkForUpdates(opts = {}) {
  try {
    if (opts.json) return;
    if (process.env.CHUB_UPDATE_CHECK === '0' || process.env.CHUB_UPDATE_CHECK === 'false') return;

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));

    const importNotifier = opts._importNotifier || (() => import('update-notifier'));
    const { default: updateNotifier } = await importNotifier();

    const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 });
    notifier.notify();
  } catch {
    // Silent — update check should never disrupt CLI
  }
}
