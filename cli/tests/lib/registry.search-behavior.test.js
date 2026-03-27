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
    JSON.stringify({
      version: '1.0.0',
      docs: docs.map((doc) => ({
        ...doc,
        source: 'official',
        languages: doc.languages || [],
      })),
      skills: [],
    }, null, 2),
  );

  writeFileSync(
    join(root, 'search-index.json'),
    JSON.stringify(buildIndex(docs)),
  );
}

async function loadRegistry(docs) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'chub-search-behavior-'));
  tempDirs.push(tempRoot);

  const sourceRoot = join(tempRoot, 'source');
  writeSource(sourceRoot, docs);

  const chubDir = join(tempRoot, '.chub');
  mkdirSync(chubDir, { recursive: true });
  writeFileSync(join(chubDir, 'config.yaml'), [
    'sources:',
    `  - name: default`,
    `    path: ${JSON.stringify(sourceRoot)}`,
    'source: official,maintainer,community',
    '',
  ].join('\n'));

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

describe('searchEntries normalization and typo handling', () => {
  it('recovers common typos and joined/split identifier forms', async () => {
    const docs = [
      {
        id: 'playwright/playwright',
        name: 'Playwright',
        description: 'Browser automation library',
        tags: ['testing'],
      },
      {
        id: 'react/react',
        name: 'React',
        description: 'React UI library',
        tags: ['react'],
      },
      {
        id: 'node-fetch/node-fetch',
        name: 'node-fetch',
        description: 'Fetch API for Node.js',
        tags: ['http'],
      },
      {
        id: 'typescript/node-fetch',
        name: 'node-fetch types',
        description: 'TypeScript support for node-fetch',
        tags: ['typescript'],
      },
      {
        id: 'auth0/identity',
        name: 'Auth0 Identity',
        description: 'Authentication and identity toolkit',
        tags: ['auth'],
      },
      {
        id: 'next/next',
        name: 'Next.js',
        description: 'React framework for production',
        tags: ['react'],
      },
      {
        id: 'eslint/eslint-config-next',
        name: 'eslint-config-next',
        description: 'ESLint preset for Next.js apps',
        tags: ['eslint'],
      },
      {
        id: 'openai/chat',
        name: 'OpenAI Chat',
        description: 'OpenAI chat docs',
        tags: ['ai'],
      },
      {
        id: 'openapi/package',
        name: 'OpenAPI',
        description: 'OpenAPI tooling docs',
        tags: ['api'],
      },
    ];

    const { searchEntries, getEntry } = await loadRegistry(docs);

    expect(searchEntries('playwrite')[0].id).toBe('playwright/playwright');
    expect(searchEntries('play wright')[0].id).toBe('playwright/playwright');
    expect(searchEntries('nodefetch')[0].id).toBe('node-fetch/node-fetch');
    expect(searchEntries('node-fetch')[0].id).toBe('node-fetch/node-fetch');
    expect(searchEntries('auth 0')[0].id).toBe('auth0/identity');
    expect(searchEntries('nextjs')[0].id).toBe('next/next');
    expect(searchEntries('open ai')[0].id).toBe('openai/chat');
    expect(searchEntries('react playwrite').slice(0, 5).map((entry) => entry.id)).toContain('playwright/playwright');
    expect(getEntry('  openai/chat  ').entry?.id).toBe('openai/chat');
  });
});
