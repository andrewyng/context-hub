import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BUNDLED_DIR = join(import.meta.dirname, '..', '..', 'dist');

let tempChubDir = null;
let backupDir = null;

function restoreBundledDir() {
  if (existsSync(BUNDLED_DIR)) {
    rmSync(BUNDLED_DIR, { recursive: true, force: true });
  }
  if (backupDir) {
    renameSync(backupDir, BUNDLED_DIR);
    backupDir = null;
  }
}

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  delete process.env.CHUB_DIR;
  if (tempChubDir) {
    rmSync(tempChubDir, { recursive: true, force: true });
    tempChubDir = null;
  }
  restoreBundledDir();
});

describe('ensureRegistry', () => {
  it('seeds bundled search-index.json alongside registry.json', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-cache-test-'));
    process.env.CHUB_DIR = tempChubDir;

    if (existsSync(BUNDLED_DIR)) {
      backupDir = mkdtempSync(join(tmpdir(), 'chub-dist-backup-'));
      rmSync(backupDir, { recursive: true, force: true });
      renameSync(BUNDLED_DIR, backupDir);
    }

    mkdirSync(BUNDLED_DIR, { recursive: true });
    writeFileSync(join(BUNDLED_DIR, 'registry.json'), JSON.stringify({
      version: '1.0.0',
      docs: [],
      skills: [],
    }));
    writeFileSync(join(BUNDLED_DIR, 'search-index.json'), JSON.stringify({
      version: '1.0.0',
      algorithm: 'bm25',
      params: { k1: 1.5, b: 0.75 },
      totalDocs: 1,
      avgFieldLengths: { name: 1, description: 1, tags: 1 },
      idf: { alpha: 1 },
      documents: [{ id: 'test/doc', tokens: { name: ['alpha'], description: [], tags: [] } }],
      invertedIndex: { alpha: [0] },
    }));

    const { ensureRegistry } = await import('../../src/lib/cache.js');
    await ensureRegistry();

    const seededRegistry = join(tempChubDir, 'sources', 'default', 'registry.json');
    const seededSearchIndex = join(tempChubDir, 'sources', 'default', 'search-index.json');
    expect(existsSync(seededRegistry)).toBe(true);
    expect(existsSync(seededSearchIndex)).toBe(true);

    const seededIndex = JSON.parse(readFileSync(seededSearchIndex, 'utf8'));
    expect(seededIndex.invertedIndex.alpha).toEqual([0]);
  });

  it('backfills a missing remote search-index.json even when registry.json is fresh', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-cache-test-'));
    process.env.CHUB_DIR = tempChubDir;

    mkdirSync(join(tempChubDir, 'sources', 'default'), { recursive: true });
    writeFileSync(join(tempChubDir, 'config.yaml'), [
      'sources:',
      '  - name: default',
      '    url: https://cdn.example.test/v1',
      'refresh_interval: 21600',
      '',
    ].join('\n'));

    writeFileSync(join(tempChubDir, 'sources', 'default', 'registry.json'), JSON.stringify({
      version: '1.0.0',
      docs: [],
      skills: [],
    }));
    writeFileSync(join(tempChubDir, 'sources', 'default', 'meta.json'), JSON.stringify({
      lastUpdated: Date.now(),
    }));

    const fetchMock = vi.fn(async (url) => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify(url.endsWith('registry.json')
        ? { version: '1.0.0', docs: [{ id: 'vendor/pkg', name: 'Pkg' }], skills: [] }
        : {
            version: '1.0.0',
            algorithm: 'bm25',
            params: { k1: 1.5, b: 0.75 },
            totalDocs: 1,
            avgFieldLengths: { id: 1, name: 1, description: 0, tags: 0 },
            idf: { pkg: 1 },
            documents: [{ id: 'vendor/pkg', tokens: { id: ['vendorpkg'], name: ['pkg'], description: [], tags: [] } }],
            invertedIndex: { pkg: [0] },
          }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { ensureRegistry } = await import('../../src/lib/cache.js');
    await ensureRegistry();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(existsSync(join(tempChubDir, 'sources', 'default', 'search-index.json'))).toBe(true);

    const meta = JSON.parse(readFileSync(join(tempChubDir, 'sources', 'default', 'meta.json'), 'utf8'));
    expect(meta.searchIndexAvailable).toBe(true);
    expect(typeof meta.searchIndexCheckedAt).toBe('number');
  });

  it('does not re-fetch when the source recently confirmed that no search index exists', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-cache-test-'));
    process.env.CHUB_DIR = tempChubDir;

    mkdirSync(join(tempChubDir, 'sources', 'default'), { recursive: true });
    writeFileSync(join(tempChubDir, 'config.yaml'), [
      'sources:',
      '  - name: default',
      '    url: https://cdn.example.test/v1',
      'refresh_interval: 21600',
      '',
    ].join('\n'));

    writeFileSync(join(tempChubDir, 'sources', 'default', 'registry.json'), JSON.stringify({
      version: '1.0.0',
      docs: [],
      skills: [],
    }));
    writeFileSync(join(tempChubDir, 'sources', 'default', 'meta.json'), JSON.stringify({
      lastUpdated: Date.now(),
      searchIndexAvailable: false,
      searchIndexCheckedAt: Date.now(),
    }));

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { fetchAllRegistries } = await import('../../src/lib/cache.js');
    await fetchAllRegistries(false);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retries search-index fetches after transient failures', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-cache-test-'));
    process.env.CHUB_DIR = tempChubDir;

    mkdirSync(join(tempChubDir, 'sources', 'default'), { recursive: true });
    writeFileSync(join(tempChubDir, 'config.yaml'), [
      'sources:',
      '  - name: default',
      '    url: https://cdn.example.test/v1',
      'refresh_interval: 21600',
      '',
    ].join('\n'));

    writeFileSync(join(tempChubDir, 'sources', 'default', 'registry.json'), JSON.stringify({
      version: '1.0.0',
      docs: [],
      skills: [],
    }));
    writeFileSync(join(tempChubDir, 'sources', 'default', 'meta.json'), JSON.stringify({
      lastUpdated: Date.now(),
    }));

    let searchIndexAttempts = 0;
    const fetchMock = vi.fn(async (url) => {
      if (url.endsWith('registry.json')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          text: async () => JSON.stringify({ version: '1.0.0', docs: [], skills: [] }),
        };
      }

      searchIndexAttempts += 1;
      if (searchIndexAttempts === 1) {
        return {
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => '',
        };
      }

      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify({
          version: '1.0.0',
          algorithm: 'bm25',
          params: { k1: 1.5, b: 0.75 },
          totalDocs: 0,
          avgFieldLengths: { id: 0, name: 0, description: 0, tags: 0 },
          idf: {},
          documents: [],
          invertedIndex: {},
        }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const { ensureRegistry } = await import('../../src/lib/cache.js');
    await ensureRegistry();
    await ensureRegistry();

    expect(searchIndexAttempts).toBe(2);
    expect(existsSync(join(tempChubDir, 'sources', 'default', 'search-index.json'))).toBe(true);

    const meta = JSON.parse(readFileSync(join(tempChubDir, 'sources', 'default', 'meta.json'), 'utf8'));
    expect(meta.searchIndexAvailable).toBe(true);
    expect(typeof meta.searchIndexCheckedAt).toBe('number');
  });

  it('clears stale negative search-index metadata after a forced refresh transient failure', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-cache-test-'));
    process.env.CHUB_DIR = tempChubDir;

    mkdirSync(join(tempChubDir, 'sources', 'default'), { recursive: true });
    writeFileSync(join(tempChubDir, 'config.yaml'), [
      'sources:',
      '  - name: default',
      '    url: https://cdn.example.test/v1',
      'refresh_interval: 21600',
      '',
    ].join('\n'));

    writeFileSync(join(tempChubDir, 'sources', 'default', 'registry.json'), JSON.stringify({
      version: '1.0.0',
      docs: [],
      skills: [],
    }));
    writeFileSync(join(tempChubDir, 'sources', 'default', 'meta.json'), JSON.stringify({
      lastUpdated: Date.now(),
      searchIndexAvailable: false,
      searchIndexCheckedAt: Date.now(),
    }));

    let searchIndexAttempts = 0;
    const fetchMock = vi.fn(async (url) => {
      if (url.endsWith('registry.json')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          text: async () => JSON.stringify({ version: '1.0.0', docs: [], skills: [] }),
        };
      }

      searchIndexAttempts += 1;
      return {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: async () => '',
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const { fetchAllRegistries } = await import('../../src/lib/cache.js');
    await fetchAllRegistries(true);

    const metaAfterForce = JSON.parse(readFileSync(join(tempChubDir, 'sources', 'default', 'meta.json'), 'utf8'));
    expect(metaAfterForce.searchIndexAvailable).toBeUndefined();
    expect(metaAfterForce.searchIndexCheckedAt).toBeUndefined();

    await fetchAllRegistries(false);
    expect(searchIndexAttempts).toBe(2);
  });
});
