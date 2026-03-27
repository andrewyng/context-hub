import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getChubDir } from './config.js';

let _cachedClientId = null;

/**
 * Get the platform-native machine UUID.
 */
function getMachineUUID() {
  const plat = platform();

  if (plat === 'darwin') {
    return execSync(
      `ioreg -rd1 -c IOPlatformExpertDevice | awk -F'"' '/IOPlatformUUID/{print $4}'`,
      { encoding: 'utf8' }
    ).trim();
  }

  if (plat === 'linux') {
    try {
      return readFileSync('/etc/machine-id', 'utf8').trim();
    } catch {
      return readFileSync('/var/lib/dbus/machine-id', 'utf8').trim();
    }
  }

  if (plat === 'win32') {
    const output = execSync(
      'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid',
      { encoding: 'utf8' }
    );
    const match = output.match(/MachineGuid\s+REG_SZ\s+(.+)/);
    if (match) return match[1].trim();
    throw new Error('Could not parse MachineGuid from registry');
  }

  throw new Error(`Unsupported platform: ${plat}`);
}

/**
 * Get or create a stable, anonymous client ID.
 * Checks ~/.chub/client_id for a cached 64-char hex string.
 * If not found, hashes the machine UUID with SHA-256 and saves it.
 */
export async function getOrCreateClientId() {
  if (_cachedClientId) return _cachedClientId;

  const chubDir = getChubDir();
  const idPath = join(chubDir, 'client_id');

  // Try to read existing client id
  try {
    const existing = readFileSync(idPath, 'utf8').trim();
    if (/^[0-9a-f]{64}$/.test(existing)) {
      _cachedClientId = existing;
      return existing;
    }
  } catch {
    // File doesn't exist or is unreadable
  }

  // Generate from machine UUID — this is a first-time user
  const uuid = getMachineUUID();
  const hash = createHash('sha256').update(uuid).digest('hex');

  // Ensure directory exists
  if (!existsSync(chubDir)) {
    mkdirSync(chubDir, { recursive: true });
  }

  writeFileSync(idPath, hash, 'utf8');
  _cachedClientId = hash;
  _isFirstRun = true;
  return hash;
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
