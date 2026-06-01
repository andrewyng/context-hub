import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildIndex } from '../../src/lib/bm25.js';

const ORIGINAL_CHUB_DIR = process.env.CHUB_DIR;
const tempDirs = [];

function writeSource(root, docs) {
  mkdirSync(root, { recursive: true });
  writeFileSync(
    join(root, 'registry.json'),
    JSON.stringify(
      {
        version: '1.0.0',
        docs: docs.map((doc) => ({
          ...doc,
          source: 'official',
          languages: doc.languages || [],
        })),
        skills: [],
      },
      null,
      2,
    ),
  );
  writeFileSync(join(root, 'search-index.json'), JSON.stringify(buildIndex(docs)));
}

async function loadRegistry(docs) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'chub-reference-expansion-'));
  tempDirs.push(tempRoot);

  const sourceRoot = join(tempRoot, 'source');
  writeSource(sourceRoot, docs);

  const chubDir = join(tempRoot, '.chub');
  mkdirSync(chubDir, { recursive: true });
  writeFileSync(
    join(chubDir, 'config.yaml'),
    [
      'sources:',
      '  - name: default',
      `    path: ${JSON.stringify(sourceRoot)}`,
      'source: official,maintainer,community',
      '',
    ].join('\n'),
  );

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

describe('searchEntries reference-file expansion', () => {
  it('finds docs by reference filenames and path topics', async () => {
    const docs = [
      {
        id: 'langchain/retrievers',
        name: 'LangChain Retrievers',
        description: 'Composable retrieval patterns and retriever abstractions.',
        tags: ['retrieval', 'langchain'],
        languages: [
          {
            language: 'python',
            recommendedVersion: '1.0',
            versions: [
              {
                version: '1.0',
                files: ['DOC.md', 'references/rrf.md', 'references/hnsw.md'],
              },
            ],
          },
        ],
      },
      {
        id: 'stripe/webhooks',
        name: 'Stripe Webhooks',
        description: 'Verify webhook signatures and process events safely.',
        tags: ['payments', 'stripe'],
        languages: [
          {
            language: 'python',
            recommendedVersion: '1.0',
            versions: [
              {
                version: '1.0',
                files: ['DOC.md', 'references/raw-body.md', 'references/signature-verification.md'],
              },
            ],
          },
        ],
      },
      {
        id: 'playwright/login-flows',
        name: 'Playwright Login Flows',
        description: 'Authentication automation recipes.',
        tags: ['playwright', 'auth'],
        languages: [
          {
            language: 'typescript',
            recommendedVersion: '1.0',
            versions: [
              {
                version: '1.0',
                files: ['DOC.md', 'guides/sign-in.md'],
              },
            ],
          },
        ],
      },
    ];

    const { searchEntries } = await loadRegistry(docs);

    expect(searchEntries('rrf')[0].id).toBe('langchain/retrievers');
    expect(searchEntries('raw body stripe')[0].id).toBe('stripe/webhooks');
    expect(searchEntries('signin')[0].id).toBe('playwright/login-flows');
  });
});
