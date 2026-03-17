#!/usr/bin/env node

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  LARK_ENTRY_DEFINITIONS,
  LARK_SOURCE_URL,
  buildEntryDoc,
  buildReferenceDoc,
  groupLarkRecords,
} from '../cli/src/lib/lark-content.js';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));

async function fetchLarkRecords(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'context-hub-lark-generator/1.0',
      accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Lark source: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.data)) {
    throw new Error('Unexpected Lark source shape: expected { data: [] }');
  }

  return payload.data.filter((record) => record?.type === 'developer' && Array.isArray(record.directory));
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writeTextFile(path, content) {
  ensureDir(dirname(path));
  writeFileSync(path, content);
}

function renderRootReadme(groups, sourceUrl) {
  const lines = [
    '# Lark Content',
    '',
    'This directory is generated from the public Lark developer documentation export.',
    '',
    `- Upstream source: ${sourceUrl}`,
    `- Generated entries: ${groups.length}`,
    '',
    '## Included entries',
    '',
  ];

  for (const group of groups) {
    lines.push(`- ${group.slug}: ${group.records.length} pages`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function writeLarkContent(groups, sourceUrl) {
  const baseDir = join(repoRoot, 'content', 'lark');
  rmSync(baseDir, { recursive: true, force: true });
  ensureDir(baseDir);
  ensureDir(join(baseDir, 'docs'));

  for (const group of groups) {
    const entryDir = join(baseDir, 'docs', group.slug);
    ensureDir(entryDir);
    writeTextFile(join(entryDir, 'DOC.md'), buildEntryDoc(group));

    for (const record of group.records) {
      const reference = buildReferenceDoc(record);
      writeTextFile(join(entryDir, reference.path), reference.content);
    }
  }

  writeTextFile(join(baseDir, 'README.md'), renderRootReadme(groups, sourceUrl));
}

async function main() {
  const sourceUrl = process.env.LARK_SOURCE_URL || LARK_SOURCE_URL;
  const records = await fetchLarkRecords(sourceUrl);
  const groups = groupLarkRecords(records);

  writeLarkContent(groups, sourceUrl);

  const pageCount = groups.reduce((sum, group) => sum + group.records.length, 0);
  console.log(
    JSON.stringify(
      {
        sourceUrl,
        supportedEntries: LARK_ENTRY_DEFINITIONS.map((entry) => entry.slug),
        generatedEntries: groups.map((group) => ({
          slug: group.slug,
          pages: group.records.length,
        })),
        totalPages: pageCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
