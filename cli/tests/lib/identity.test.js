import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Track agent-detection env vars we may have mutated so we can restore them.
const AGENT_ENV_KEYS = [
  'CLAUDE_CODE', 'CLAUDE_SESSION_ID', 'CLAUDE_CODE_VERSION',
  'CURSOR_SESSION_ID', 'CURSOR_TRACE_ID', 'CURSOR_VERSION',
  'CODEX_HOME', 'CODEX_SESSION',
  'WINDSURF_SESSION', 'AIDER_MODEL', 'AIDER', 'CLINE_SESSION', 'GITHUB_COPILOT',
];

const originalChubDir = process.env.CHUB_DIR;
const originalAgentEnv = {};
let tempChubDir;

beforeAll(() => {
  tempChubDir = mkdtempSync(join(tmpdir(), 'chub-identity-test-'));
  process.env.CHUB_DIR = tempChubDir;
  for (const k of AGENT_ENV_KEYS) originalAgentEnv[k] = process.env[k];
});

afterAll(() => {
  if (originalChubDir === undefined) delete process.env.CHUB_DIR;
  else process.env.CHUB_DIR = originalChubDir;
  if (tempChubDir) rmSync(tempChubDir, { recursive: true, force: true });
});

beforeEach(() => {
  // Clear agent env vars so each test starts from a known state.
  for (const k of AGENT_ENV_KEYS) delete process.env[k];
  // Wipe the temp chub dir + the module's cached client id by resetting modules.
  try { rmSync(tempChubDir, { recursive: true, force: true }); } catch {}
  mkdirSync(tempChubDir, { recursive: true });
  vi.resetModules();
});

afterEach(() => {
  // Restore any agent env vars we wiped.
  for (const k of AGENT_ENV_KEYS) {
    if (originalAgentEnv[k] === undefined) delete process.env[k];
    else process.env[k] = originalAgentEnv[k];
  }
});

async function loadIdentity() {
  return await import('../../src/lib/identity.js');
}

describe('getOrCreateClientId', () => {
  it('creates a new 64-char hex client_id on first call', async () => {
    const { getOrCreateClientId } = await loadIdentity();
    const id = await getOrCreateClientId();
    expect(id).toMatch(/^[0-9a-f]{64}$/);
  });

  it('persists the id to ~/.chub/client_id', async () => {
    const { getOrCreateClientId } = await loadIdentity();
    const id = await getOrCreateClientId();
    const onDisk = readFileSync(join(tempChubDir, 'client_id'), 'utf8').trim();
    expect(onDisk).toBe(id);
  });

  it('returns the same id across calls within one process', async () => {
    const { getOrCreateClientId } = await loadIdentity();
    const id1 = await getOrCreateClientId();
    const id2 = await getOrCreateClientId();
    expect(id1).toBe(id2);
  });

  it('re-uses a valid existing client_id from disk', async () => {
    const existing = 'a'.repeat(64);
    writeFileSync(join(tempChubDir, 'client_id'), existing);
    const { getOrCreateClientId } = await loadIdentity();
    expect(await getOrCreateClientId()).toBe(existing);
  });

  it('regenerates the id when the stored value is malformed', async () => {
    writeFileSync(join(tempChubDir, 'client_id'), 'not-a-valid-id');
    const { getOrCreateClientId } = await loadIdentity();
    const id = await getOrCreateClientId();
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(id).not.toBe('not-a-valid-id');
  });

  it('creates the chub dir if it does not exist', async () => {
    rmSync(tempChubDir, { recursive: true, force: true });
    const { getOrCreateClientId } = await loadIdentity();
    const id = await getOrCreateClientId();
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(readFileSync(join(tempChubDir, 'client_id'), 'utf8').trim()).toBe(id);
  });
});

describe('isFirstRun', () => {
  it('returns false before getOrCreateClientId is called', async () => {
    const { isFirstRun } = await loadIdentity();
    expect(isFirstRun()).toBe(false);
  });

  it('returns true after a fresh id is generated', async () => {
    const { getOrCreateClientId, isFirstRun } = await loadIdentity();
    await getOrCreateClientId();
    expect(isFirstRun()).toBe(true);
  });

  it('returns false when an existing id was re-used', async () => {
    writeFileSync(join(tempChubDir, 'client_id'), 'b'.repeat(64));
    const { getOrCreateClientId, isFirstRun } = await loadIdentity();
    await getOrCreateClientId();
    expect(isFirstRun()).toBe(false);
  });
});

describe('detectAgent', () => {
  it('returns "unknown" when no agent env vars are set', async () => {
    const { detectAgent } = await loadIdentity();
    expect(detectAgent()).toBe('unknown');
  });

  it('detects claude-code from CLAUDE_CODE', async () => {
    process.env.CLAUDE_CODE = '1';
    const { detectAgent } = await loadIdentity();
    expect(detectAgent()).toBe('claude-code');
  });

  it('detects claude-code from CLAUDE_SESSION_ID', async () => {
    process.env.CLAUDE_SESSION_ID = 'abc';
    const { detectAgent } = await loadIdentity();
    expect(detectAgent()).toBe('claude-code');
  });

  it('detects cursor', async () => {
    process.env.CURSOR_SESSION_ID = 'xyz';
    const { detectAgent } = await loadIdentity();
    expect(detectAgent()).toBe('cursor');
  });

  it('detects codex, windsurf, aider, cline, copilot', async () => {
    const cases = [
      ['CODEX_HOME', 'codex'],
      ['WINDSURF_SESSION', 'windsurf'],
      ['AIDER', 'aider'],
      ['CLINE_SESSION', 'cline'],
      ['GITHUB_COPILOT', 'copilot'],
    ];
    for (const [envKey, expected] of cases) {
      for (const k of AGENT_ENV_KEYS) delete process.env[k];
      process.env[envKey] = '1';
      vi.resetModules();
      const { detectAgent } = await loadIdentity();
      expect(detectAgent()).toBe(expected);
    }
  });
});

describe('detectAgentVersion', () => {
  it('returns undefined when no version env var is set', async () => {
    const { detectAgentVersion } = await loadIdentity();
    expect(detectAgentVersion()).toBeUndefined();
  });

  it('returns CLAUDE_CODE_VERSION when set', async () => {
    process.env.CLAUDE_CODE_VERSION = '1.2.3';
    const { detectAgentVersion } = await loadIdentity();
    expect(detectAgentVersion()).toBe('1.2.3');
  });

  it('returns CURSOR_VERSION when set', async () => {
    process.env.CURSOR_VERSION = '0.42';
    const { detectAgentVersion } = await loadIdentity();
    expect(detectAgentVersion()).toBe('0.42');
  });
});
