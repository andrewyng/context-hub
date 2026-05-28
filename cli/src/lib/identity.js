import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getChubDir } from './config.js';

let _cachedClientId = null;

/**
 * Get or create a stable, anonymous client ID.
 * Checks ~/.chub/client_id for a cached 64-char hex string.
 * If not found, generates a random 32-byte value and saves it.
 */
export async function getOrCreateClientId() {
  if (_cachedClientId) return _cachedClientId;

  const chubDir = getChubDir();
  const idPath = join(chubDir, 'client_id');

  try {
    const existing = readFileSync(idPath, 'utf8').trim();
    if (/^[0-9a-f]{64}$/.test(existing)) {
      _cachedClientId = existing;
      return existing;
    }
  } catch {
    // File doesn't exist or is unreadable
  }

  // No existing ID — generate a random one. Not derived from any hardware
  // identifier, so it cannot be re-derived or cross-referenced against the
  // machine. Deleting ~/.chub gives the user a fresh ID.
  const id = randomBytes(32).toString('hex');

  if (!existsSync(chubDir)) {
    mkdirSync(chubDir, { recursive: true });
  }

  writeFileSync(idPath, id, 'utf8');
  _cachedClientId = id;
  _isFirstRun = true;
  return id;
}

let _isFirstRun = false;

/**
 * Returns true if this is the first time the CLI has run on this machine.
 * Only valid after getOrCreateClientId() has been called.
 */
export function isFirstRun() {
  return _isFirstRun;
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
