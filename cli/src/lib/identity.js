import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getChubDir } from './config.js';

let _cachedClientId = null;

/**
 * Get or create a stable, anonymous client ID.
 * Checks ~/.chub/client_id for a persisted value.
 * If not found, generates a random UUID (no hardware fingerprinting).
 *
 * Existing client_id files (64-char hex from previous versions) are
 * accepted as-is so upgrades are seamless.
 */
export async function getOrCreateClientId() {
  if (_cachedClientId) return _cachedClientId;

  const chubDir = getChubDir();
  const idPath = join(chubDir, 'client_id');

  // Try to read existing client id
  try {
    const existing = readFileSync(idPath, 'utf8').trim();
    if (existing.length > 0) {
      _cachedClientId = existing;
      return existing;
    }
  } catch {
    // File doesn't exist or is unreadable
  }

  // Generate a random ID (no hardware binding)
  const id = randomUUID();

  try {
    if (!existsSync(chubDir)) {
      mkdirSync(chubDir, { recursive: true });
    }
    writeFileSync(idPath, id, 'utf8');
  } catch {
    // Non-fatal — use the ID in memory for this session
  }

  _cachedClientId = id;
  return id;
}

/**
 * Auto-detect the AI coding tool from environment variables.
 */
export function detectAgent() {
  if (process.env.CLAUDE_CODE || process.env.CLAUDE_SESSION_ID) return 'claude-code';
  if (process.env.CURSOR_SESSION_ID || process.env.CURSOR_TRACE_ID) return 'cursor';
  if (process.env.CODEX_HOME || process.env.CODEX_SESSION) return 'codex';
  if (process.env.WINDSURF_SESSION) return 'windsurf';
  if (process.env.AIDER_MODEL || process.env.AIDER) return 'aider';
  if (process.env.CLINE_SESSION) return 'cline';
  if (process.env.GITHUB_COPILOT) return 'copilot';
  return 'unknown';
}

/**
 * Detect the version of the AI coding tool, if available.
 */
export function detectAgentVersion() {
  return process.env.CLAUDE_CODE_VERSION || process.env.CURSOR_VERSION || undefined;
}
