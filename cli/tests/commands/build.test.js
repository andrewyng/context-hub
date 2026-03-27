import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CLI_BIN = join(import.meta.dirname, '..', '..', 'bin', 'chub');
const FIXTURES = join(import.meta.dirname, '..', '..', 'test', 'fixtures');
const BUILD_TEST_TIMEOUT = 15000;
const itBuild = (name, fn) => it(name, { timeout: BUILD_TEST_TIMEOUT }, fn);
const TEST_ENV = { ...process.env, CHUB_TELEMETRY: '0', CHUB_FEEDBACK: '0' };

describe('chub build', () => {
  itBuild('validates test fixtures and finds docs and skills', () => {
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, 'build', FIXTURES, '--validate-only', '--json'],
      { encoding: 'utf8', env: TEST_ENV },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed).toHaveProperty('docs');
    expect(parsed).toHaveProperty('skills');
    expect(parsed).toHaveProperty('warnings');
    expect(parsed.docs).toBeGreaterThanOrEqual(1);
    expect(parsed.skills).toBeGreaterThanOrEqual(1);
  });

  itBuild('finds expected docs and skills in fixtures', () => {
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, 'build', FIXTURES, '--validate-only', '--json'],
      { encoding: 'utf8', env: TEST_ENV },
    );

    const parsed = JSON.parse(result.trim());
    // test/fixtures has 3 docs (acme/widgets, acme/versioned-api, multilang/client) and 1 skill (testskills/deploy)
    expect(parsed.docs).toBe(3);
    expect(parsed.skills).toBe(1);
  });

  itBuild('writes a search index with an inverted index', () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'chub-build-'));

    try {
      execFileSync(
        process.execPath,
        [CLI_BIN, 'build', FIXTURES, '--json', '-o', outputDir],
        { encoding: 'utf8', env: TEST_ENV },
      );

      const searchIndex = JSON.parse(readFileSync(join(outputDir, 'search-index.json'), 'utf8'));
      expect(searchIndex).toHaveProperty('invertedIndex');
      expect(searchIndex.invertedIndex).toHaveProperty('widget');
    } finally {
      rmSync(outputDir, { recursive: true, force: true });
    }
  });

  itBuild('exits with error for nonexistent directory', () => {
    let threw = false;
    try {
      execFileSync(
        process.execPath,
        [CLI_BIN, 'build', '/tmp/nonexistent-dir-xyz-12345', '--validate-only', '--json'],
        { encoding: 'utf8', stdio: 'pipe', env: TEST_ENV },
      );
    } catch (err) {
      threw = true;
      expect(err.status).not.toBe(0);
      expect(err.stderr.toString()).toContain('not found');
    }
    expect(threw).toBe(true);
  });
});
