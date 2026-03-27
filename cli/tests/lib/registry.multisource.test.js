import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildIndex } from '../../src/lib/bm25.js';

const ORIGINAL_CHUB_DIR = process.env.CHUB_DIR;
const tempDirs = [];

function writeSource(root, quality, description, tags = []) {
  mkdirSync(root, { recursive: true });
  writeFileSync(
    join(root, 'registry.json'),
    JSON.stringify({
      version: '1.0.0',
      docs: [
        {
          id: 'shared/api',
          name: 'shared api',
          description,
          source: quality,
          tags,
          languages: [
            {
              language: 'javascript',
              recommendedVersion: '1.0.0',
              versions: [
                {
                  version: '1.0.0',
                  path: 'shared/api/javascript',
                  files: ['DOC.md'],
                },
              ],
            },
          ],
        },
      ],
      skills: [],
    }, null, 2)
  );

  writeFileSync(
    join(root, 'search-index.json'),
    JSON.stringify(
      buildIndex([
        {
          id: 'shared/api',
          name: 'shared api',
          description,
          tags,
        },
      ])
    )
  );
}

async function loadRegistryWithSources(sourceRoots) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'chub-multisource-'));
  tempDirs.push(tempRoot);

  const chubDir = join(tempRoot, '.chub');
  mkdirSync(chubDir, { recursive: true });

  const config = [
    'sources:',
    ...sourceRoots.map(({ name, root }) => `  - name: ${name}\n    path: ${JSON.stringify(root)}`),
    'source: official,maintainer,community',
  ].join('\n');

  writeFileSync(join(chubDir, 'config.yaml'), `${config}\n`);
  process.env.CHUB_DIR = chubDir;

  vi.resetModules();
  return import('../../src/lib/registry.js');
}

afterEach(() => {
  vi.resetModules();
  if (ORIGINAL_CHUB_DIR === undefined) delete process.env.CHUB_DIR;
  else process.env.CHUB_DIR = ORIGINAL_CHUB_DIR;

  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

describe('searchEntries multi-source collisions', () => {
  it('returns the entry from the matching source when multiple sources share an id', async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'chub-multisource-data-'));
    tempDirs.push(tempRoot);

    const alpha = join(tempRoot, 'alpha');
    const beta = join(tempRoot, 'beta');
    writeSource(alpha, 'official', 'Alpha payments integration', ['payments']);
    writeSource(beta, 'official', 'Beta observability traces', ['tracing']);

    const { searchEntries } = await loadRegistryWithSources([
      { name: 'alpha', root: alpha },
      { name: 'beta', root: beta },
    ]);

    const payments = searchEntries('payments');
    const tracing = searchEntries('tracing');

    expect(payments).toHaveLength(1);
    expect(payments[0]._source).toBe('alpha');
    expect(payments[0].description).toContain('payments');

    expect(tracing).toHaveLength(1);
    expect(tracing[0]._source).toBe('beta');
    expect(tracing[0].description).toContain('traces');
  });

  it('keeps both search results when duplicate ids exist across sources', async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'chub-multisource-data-'));
    tempDirs.push(tempRoot);

    const alpha = join(tempRoot, 'alpha');
    const beta = join(tempRoot, 'beta');
    writeSource(alpha, 'official', 'Alpha shared API for payments', ['payments']);
    writeSource(beta, 'official', 'Beta shared API for tracing', ['tracing']);

    const { searchEntries } = await loadRegistryWithSources([
      { name: 'alpha', root: alpha },
      { name: 'beta', root: beta },
    ]);

    const results = searchEntries('shared');

    expect(results).toHaveLength(2);
    expect(new Set(results.map((entry) => entry._source))).toEqual(new Set(['alpha', 'beta']));
  });
});
