#!/usr/bin/env node

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { getVersionedHelpPayload } from '../cli/src/lib/help.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const outputDir = resolve(repoRoot, process.env.CHUB_CDN_OUTPUT_DIR || 'dist');
const baseUrl = process.env.CHUB_CDN_BASE_URL || 'https://cdn.aichub.org/v1';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function detectHelpRevision() {
  if (process.env.CHUB_HELP_REVISION) return process.env.CHUB_HELP_REVISION;
  if (process.env.GITHUB_SHA) return `git-${process.env.GITHUB_SHA.slice(0, 7)}`;

  const result = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  });

  if (result.status === 0) {
    return `git-${result.stdout.trim()}`;
  }

  return new Date().toISOString();
}

function loadCliVersion() {
  const cliPackage = JSON.parse(readFileSync(join(repoRoot, 'cli', 'package.json'), 'utf8'));
  if (typeof cliPackage.version !== 'string' || !cliPackage.version.trim()) {
    throw new Error('Unable to determine CLI version from cli/package.json');
  }

  return cliPackage.version;
}

function buildContentBundle() {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  run('node', ['cli/bin/chub', 'build', 'content/', '-o', outputDir, '--base-url', baseUrl], {
    cwd: repoRoot,
    env: {
      ...process.env,
      CHUB_TELEMETRY: '0',
    },
  });
}

function writeVersionedHelpFile(cliVersion) {
  const helpDir = join(outputDir, 'help');
  mkdirSync(helpDir, { recursive: true });

  const payload = getVersionedHelpPayload(cliVersion, {
    helpRevision: detectHelpRevision(),
    updatedAt: process.env.CHUB_HELP_UPDATED_AT || new Date().toISOString(),
  });

  const outputPath = join(helpDir, `${cliVersion}.json`);
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return outputPath;
}

const cliVersion = loadCliVersion();
buildContentBundle();
const helpPath = writeVersionedHelpFile(cliVersion);

process.stdout.write(`Prepared CDN build in ${outputDir}\n`);
process.stdout.write(`Wrote versioned help to ${helpPath}\n`);
