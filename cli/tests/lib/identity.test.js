import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const tempRoots = [];

function createTempChubDir() {
  const root = mkdtempSync(join(tmpdir(), 'chub-identity-'));
  tempRoots.push(root);
  return join(root, '.chub');
}

async function loadIdentityModule({ platformName = 'linux', readFileSyncImpl, execSyncImpl } = {}) {
  vi.resetModules();

  vi.doMock('node:os', async () => {
    const actual = await vi.importActual('node:os');
    return {
      ...actual,
      platform: () => platformName,
    };
  });

  vi.doMock('node:child_process', async () => {
    const actual = await vi.importActual('node:child_process');
    return {
      ...actual,
      execSync: execSyncImpl ?? actual.execSync,
    };
  });

  vi.doMock('node:fs', async () => {
    const actual = await vi.importActual('node:fs');
    return {
      ...actual,
      readFileSync: readFileSyncImpl ?? actual.readFileSync,
    };
  });

  return import('../../src/lib/identity.js');
}

describe('identity', () => {
  beforeEach(() => {
    delete process.env.CHUB_DIR;
  });

  afterEach(() => {
    delete process.env.CHUB_DIR;
    vi.restoreAllMocks();
    vi.resetModules();
    vi.doUnmock('node:os');
    vi.doUnmock('node:fs');
    vi.doUnmock('node:child_process');

    for (const root of tempRoots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reuses an existing cached client_id without touching platform lookup', async () => {
    const chubDir = createTempChubDir();
    mkdirSync(chubDir, { recursive: true });

    const existingId = 'a'.repeat(64);
    writeFileSync(join(chubDir, 'client_id'), existingId, 'utf8');
    process.env.CHUB_DIR = chubDir;

    const execSyncImpl = vi.fn(() => {
      throw new Error('should not be called');
    });

    const { getOrCreateClientId } = await loadIdentityModule({
      platformName: 'darwin',
      execSyncImpl,
    });

    await expect(getOrCreateClientId()).resolves.toBe(existingId);
    expect(execSyncImpl).not.toHaveBeenCalled();
  });

  it('falls back to the secondary Linux machine-id path when needed', async () => {
    const chubDir = createTempChubDir();
    process.env.CHUB_DIR = chubDir;

    const readFileSyncImpl = vi.fn((path, encoding) => {
      if (path === '/etc/machine-id') {
        throw new Error('primary machine-id missing');
      }
      if (path === '/var/lib/dbus/machine-id') {
        return 'secondary-machine-id';
      }
      return readFileSync(path, encoding);
    });

    const { getOrCreateClientId } = await loadIdentityModule({
      platformName: 'linux',
      readFileSyncImpl,
    });

    const clientId = await getOrCreateClientId();
    const expected = createHash('sha256').update('secondary-machine-id').digest('hex');

    expect(clientId).toBe(expected);
    expect(readFileSyncImpl).toHaveBeenCalledWith('/etc/machine-id', 'utf8');
    expect(readFileSyncImpl).toHaveBeenCalledWith('/var/lib/dbus/machine-id', 'utf8');
    expect(readFileSync(join(chubDir, 'client_id'), 'utf8').trim()).toBe(expected);
  });

  it('persists a random client_id when platform UUID lookup fails', async () => {
    const chubDir = createTempChubDir();
    process.env.CHUB_DIR = chubDir;

    const execSyncImpl = vi.fn(() => {
      throw new Error('ioreg failed');
    });

    const firstLoad = await loadIdentityModule({
      platformName: 'darwin',
      execSyncImpl,
    });
    const firstId = await firstLoad.getOrCreateClientId();

    expect(firstId).toMatch(/^[0-9a-f]{64}$/);
    expect(readFileSync(join(chubDir, 'client_id'), 'utf8').trim()).toBe(firstId);

    const secondLoad = await loadIdentityModule({
      platformName: 'darwin',
      execSyncImpl,
    });
    const secondId = await secondLoad.getOrCreateClientId();

    expect(secondId).toBe(firstId);
    expect(execSyncImpl).toHaveBeenCalledTimes(1);
  });
});
