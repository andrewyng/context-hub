import { createHash, randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getChubDir } from './config.js';

let _cachedClientId = null;

/**
 * Get the platform-native machine UUID.
 */
function ensureNonEmpty(value, context) {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${context} returned an empty value`);
  }
  return normalized;
}

function readFirstAvailableFile(paths) {
  const errors = [];

  for (const path of paths) {
    try {
      return ensureNonEmpty(readFileSync(path, 'utf8'), path);
    } catch (error) {
      errors.push(new Error(`Failed to read ${path}: ${error.message}`, { cause: error }));
    }
  }

  throw new AggregateError(errors, 'Could not read a machine ID from any known Linux path');
}

function execMachineUUID(command, context) {
  try {
    return ensureNonEmpty(execSync(command, { encoding: 'utf8' }), context);
  } catch (error) {
    throw new Error(`Failed to read machine UUID via ${context}`, { cause: error });
  }
}

function getMachineUUID() {
  const plat = platform();

  if (plat === 'darwin') {
    return execMachineUUID(
      `ioreg -rd1 -c IOPlatformExpertDevice | awk -F'"' '/IOPlatformUUID/{print $4}'`,
      'ioreg'
    );
  }

  if (plat === 'linux') {
    return readFirstAvailableFile([
      '/etc/machine-id',
      '/var/lib/dbus/machine-id',
    ]);
  }

  if (plat === 'win32') {
    const output = execMachineUUID(
      'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid',
      'reg'
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

  let clientId;
  try {
    const uuid = getMachineUUID();
    clientId = createHash('sha256').update(uuid).digest('hex');
  } catch {
    // Keep feedback/telemetry non-blocking when platform ID lookup is unavailable.
    clientId = randomBytes(32).toString('hex');
  }

  // Ensure directory exists
  if (!existsSync(chubDir)) {
    mkdirSync(chubDir, { recursive: true });
  }

  writeFileSync(idPath, clientId, 'utf8');
  _cachedClientId = clientId;
  return clientId;
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
