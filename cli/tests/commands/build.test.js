import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const CLI_BIN = join(import.meta.dirname, '..', '..', 'bin', 'chub');
const FIXTURES = join(import.meta.dirname, '..', 'fixtures');

describe('chub build', () => {
  it('validates test fixtures and finds docs and skills', () => {
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, 'build', FIXTURES, '--validate-only', '--json'],
      { encoding: 'utf8' },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed).toHaveProperty('docs');
    expect(parsed).toHaveProperty('skills');
    expect(parsed).toHaveProperty('warnings');
    expect(parsed.docs).toBeGreaterThanOrEqual(1);
    expect(parsed.skills).toBeGreaterThanOrEqual(1);
  });

  it('finds expected docs and skills in fixtures', () => {
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, 'build', FIXTURES, '--validate-only', '--json'],
      { encoding: 'utf8' },
    );

    const parsed = JSON.parse(result.trim());
    // fixtures has 3 docs (acme/widgets, acme/versioned-api, multilang/client) and 1 skill (testskills/deploy)
    expect(parsed.docs).toBe(3);
    expect(parsed.skills).toBe(1);
  });

  it('exits with error for nonexistent directory', () => {
    let threw = false;
    try {
      execFileSync(
        process.execPath,
        [CLI_BIN, 'build', '/tmp/nonexistent-dir-xyz-12345', '--validate-only', '--json'],
        { encoding: 'utf8', stdio: 'pipe' },
      );
    } catch (err) {
      threw = true;
      expect(err.status).not.toBe(0);
      expect(err.stderr.toString()).toContain('not found');
    }
    expect(threw).toBe(true);
  });
});
