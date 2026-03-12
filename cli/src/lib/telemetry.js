import { loadConfig } from './config.js';

const DEFAULT_TELEMETRY_URL = 'https://api.aichub.org/v1';

export function isTelemetryEnabled() {
  if (process.env.CHUB_TELEMETRY === '0' || process.env.CHUB_TELEMETRY === 'false') return false;
  const config = loadConfig();
  return config.telemetry !== false;
}

export function isFeedbackEnabled() {
  if (process.env.CHUB_FEEDBACK === '0' || process.env.CHUB_FEEDBACK === 'false') return false;
  const config = loadConfig();
  return config.feedback !== false;
}

export function getTelemetryUrl() {
  const url = process.env.CHUB_TELEMETRY_URL;
  if (url) return url;
  const config = loadConfig();
  return config.telemetry_url || DEFAULT_TELEMETRY_URL;
}

/**
 * Send feedback to the API.
 *
 * @param {string} entryId - e.g. "openai/chat"
 * @param {string} entryType - "doc" or "skill"
 * @param {string} rating - "up" or "down"
 * @param {object} opts - Additional context
 * @param {string} [opts.comment]
 * @param {string} [opts.docLang] - Language variant fetched
 * @param {string} [opts.docVersion] - Version fetched
 * @param {string} [opts.targetFile] - Specific file within the entry
 * @param {string[]} [opts.labels] - Structured feedback labels
 * @param {string} [opts.agent] - Agent name override
 * @param {string} [opts.model] - LLM model override
 * @param {string} [opts.cliVersion]
 * @param {string} [opts.source] - Registry source name
 */
export async function sendFeedback(entryId, entryType, rating, opts = {}) {
  if (!isFeedbackEnabled()) return { status: 'skipped', reason: 'feedback_disabled' };

  const { getOrCreateClientId, detectAgent, detectAgentVersion } = await import('./identity.js');
  const clientId = await getOrCreateClientId();
  const telemetryUrl = getTelemetryUrl();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`${telemetryUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-ID': clientId,
      },
      body: JSON.stringify({
        entry_id: entryId,
        entry_type: entryType,
        rating,
        // Doc-specific dimensions
        doc_lang: opts.docLang || undefined,
        doc_version: opts.docVersion || undefined,
        target_file: opts.targetFile || undefined,
        // Structured feedback
        labels: opts.labels || undefined,
        comment: opts.comment || undefined,
        // Agent info
        agent: {
          name: opts.agent || detectAgent(),
          version: detectAgentVersion(),
          model: opts.model || undefined,
        },
        // Context
        cli_version: opts.cliVersion || undefined,
        source: opts.source || undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return { status: 'sent', feedback_id: data.feedback_id || data.id };
    }
    return { status: 'error', code: res.status };
  } catch (err) {
    clearTimeout(timeout);
    return { status: 'error', reason: 'network' };
  }
}
