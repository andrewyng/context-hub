import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'bin', 'chub');
const CLI_PACKAGE = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
const CLI_VERSION = CLI_PACKAGE.version;
const FIXTURES = join(__dirname, 'fixtures');
const BUILD_OUTPUT = join(FIXTURES, 'dist');
const CLI_TEST_TIMEOUT = 15000;
const TEST_ENV = {
  ...process.env,
  NO_COLOR: '1',
  CHUB_TELEMETRY: '0',
  CHUB_FEEDBACK: '0',
};

let tmpChubDir;

const itCli = (name, fn) => it(name, { timeout: CLI_TEST_TIMEOUT }, fn);

function chub(args, { expectError = false, env = {} } = {}) {
  try {
    const result = execFileSync('node', [CLI, ...args], {
      encoding: 'utf8',
      env: { ...TEST_ENV, CHUB_DIR: tmpChubDir, ...env },
      timeout: CLI_TEST_TIMEOUT,
    });
    return result;
  } catch (err) {
    if (expectError) return err.stderr || err.stdout || err.message;
    throw err;
  }
}

function chubJSON(args) {
  const out = chub([...args, '--json']);
  return JSON.parse(out);
}

describe('chub CLI e2e', () => {
  beforeAll(() => {
    // Use an isolated temp directory so we never touch ~/.chub
    tmpChubDir = mkdtempSync(join(tmpdir(), 'chub-e2e-'));

    // Build fixtures
    chub(['build', FIXTURES]);

    // Point config at fixture build output (local source only)
    writeFileSync(join(tmpChubDir, 'config.yaml'), `sources:\n  - name: test\n    path: ${BUILD_OUTPUT}\n\nsource: official,maintainer,community\ntelemetry: false\nfeedback: false\n`);
  }, CLI_TEST_TIMEOUT);

  afterAll(() => {
    // Clean up temp dir and build output
    rmSync(tmpChubDir, { recursive: true, force: true });
    rmSync(BUILD_OUTPUT, { recursive: true, force: true });
  });

  describe('build', () => {
    itCli('keeps first-run JSON output clean', () => {
      const freshChubDir = mkdtempSync(join(tmpdir(), 'chub-e2e-json-'));
      try {
        writeFileSync(join(freshChubDir, 'config.yaml'), `sources:\n  - name: test\n    path: ${BUILD_OUTPUT}\n\nsource: official,maintainer,community\ntelemetry: false\nfeedback: false\n`);
        const result = spawnSync('node', [CLI, 'build', FIXTURES, '--validate-only', '--json'], {
          encoding: 'utf8',
          env: { ...TEST_ENV, CHUB_DIR: freshChubDir },
          timeout: CLI_TEST_TIMEOUT,
        });

        expect(result.status).toBe(0);
        expect(() => JSON.parse(result.stdout)).not.toThrow();
        expect(result.stderr).toBe('');
      } finally {
        rmSync(freshChubDir, { recursive: true, force: true });
      }
    });

    itCli('produces registry.json', () => {
      expect(existsSync(join(BUILD_OUTPUT, 'registry.json'))).toBe(true);
    });

    itCli('registry has correct counts', () => {
      const reg = JSON.parse(readFileSync(join(BUILD_OUTPUT, 'registry.json'), 'utf8'));
      expect(reg.docs.length).toBe(3); // acme/widgets + acme/versioned-api + multilang/client
      expect(reg.skills.length).toBe(1); // testskills/deploy
    });

    itCli('copies content files to output', () => {
      expect(existsSync(join(BUILD_OUTPUT, 'acme', 'docs', 'widgets', 'DOC.md'))).toBe(true);
      expect(existsSync(join(BUILD_OUTPUT, 'acme', 'docs', 'widgets', 'references', 'advanced.md'))).toBe(true);
    });

    itCli('validates with --validate-only', () => {
      const out = chub(['build', FIXTURES, '--validate-only']);
      expect(out).toContain('3 docs');
      expect(out).toContain('1 skills');
    });

    itCli('errors on missing content dir', () => {
      const out = chub(['build', '/nonexistent/path'], { expectError: true });
      expect(out).toContain('Content directory not found');
    });
  });

  describe('search', () => {
    itCli('lists all entries', () => {
      const data = chubJSON(['search']);
      expect(data.total).toBe(4); // 3 docs + 1 skill
    });

    itCli('fuzzy search finds by name', () => {
      const data = chubJSON(['search', 'widget']);
      expect(data.results.length).toBe(1);
      expect(data.results[0].id).toBe('acme/widgets');
    });

    itCli('fuzzy search finds by description', () => {
      const data = chubJSON(['search', 'deployment']);
      expect(data.results.length).toBe(1);
      expect(data.results[0].id).toBe('testskills/deploy');
    });

    itCli('exact id shows detail', () => {
      const data = chubJSON(['search', 'acme/widgets']);
      // Exact match returns the entry directly, not wrapped in results[]
      expect(data.id).toBe('acme/widgets');
      expect(data.languages).toBeDefined();
    });

    itCli('filters by tag', () => {
      const data = chubJSON(['search', '--tags', 'automation']);
      expect(data.results.length).toBe(1);
      expect(data.results[0].id).toBe('testskills/deploy');
    });

    itCli('returns empty for no match', () => {
      const data = chubJSON(['search', 'nonexistentthing']);
      expect(data.results.length).toBe(0);
    });
  });

  describe('help', () => {
    itCli('returns bundled local help when remote help is disabled', () => {
      const out = chub(['help', '--json'], {
        env: {
          CHUB_HELP_URL: 'off',
        },
      });
      const data = JSON.parse(out);
      expect(data.content).toContain('Getting Started');
      expect(data.content).toContain('Agent Workflow');
      expect(data.content).toContain('npx skills add https://github.com/andrewyng/context-hub --skill get-api-docs');
      expect(data.content).toContain('$(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md');
      expect(data.content).toContain('cli/skills/get-api-docs/SKILL.md');
      expect(data.source).toBe('local');
    });

    itCli('retrieves the matching remote help version when available', () => {
      const payload = encodeURIComponent(JSON.stringify({
        schema_version: 1,
        cli_version: '{version}',
        help_revision: '2026-04-01.1',
        content: 'Remote bootstrap instructions for {version}',
      })).replaceAll('%7Bversion%7D', '{version}');

      const out = chub(['help', '--json'], {
        env: {
          CHUB_HELP_URL: `data:application/json,${payload}`,
          CHUB_HELP_TIMEOUT_MS: '1000',
        },
      });

      const data = JSON.parse(out);
      expect(data.source).toBe('remote');
      expect(data.requestedVersion).toBe(CLI_VERSION);
      expect(data.resolvedVersion).toBe(CLI_VERSION);
      expect(data.resolution).toBe('exact');
      expect(data.helpRevision).toBe('2026-04-01.1');
      expect(data.content).toBe(`Remote bootstrap instructions for ${CLI_VERSION}`);
    });

    itCli('root command uses versioned help when available', () => {
      const payload = encodeURIComponent(JSON.stringify({
        schema_version: 1,
        cli_version: '{version}',
        help_revision: '2026-04-01.1',
        content: 'Root bootstrap instructions for {version}',
      })).replaceAll('%7Bversion%7D', '{version}');

      const out = chub(['--json'], {
        env: {
          CHUB_HELP_URL: `data:application/json,${payload}`,
          CHUB_HELP_TIMEOUT_MS: '1000',
        },
      });

      const data = JSON.parse(out);
      expect(data.source).toBe('remote');
      expect(data.content).toBe(`Root bootstrap instructions for ${CLI_VERSION}`);
    });

    itCli('root --help uses the same versioned bootstrap help', () => {
      const payload = encodeURIComponent(JSON.stringify({
        schema_version: 1,
        cli_version: '{version}',
        help_revision: '2026-04-01.1',
        content: 'Flag bootstrap instructions for {version}',
      })).replaceAll('%7Bversion%7D', '{version}');

      const out = chub(['--help', '--json'], {
        env: {
          CHUB_HELP_URL: `data:application/json,${payload}`,
          CHUB_HELP_TIMEOUT_MS: '1000',
        },
      });

      const data = JSON.parse(out);
      expect(data.source).toBe('remote');
      expect(data.content).toBe(`Flag bootstrap instructions for ${CLI_VERSION}`);
    });

    itCli('help --help uses the same versioned bootstrap help', () => {
      const payload = encodeURIComponent(JSON.stringify({
        schema_version: 1,
        cli_version: '{version}',
        help_revision: '2026-04-01.1',
        content: 'Help flag bootstrap instructions for {version}',
      })).replaceAll('%7Bversion%7D', '{version}');

      const out = chub(['help', '--help', '--json'], {
        env: {
          CHUB_HELP_URL: `data:application/json,${payload}`,
          CHUB_HELP_TIMEOUT_MS: '1000',
        },
      });

      const data = JSON.parse(out);
      expect(data.source).toBe('remote');
      expect(data.content).toBe(`Help flag bootstrap instructions for ${CLI_VERSION}`);
    });

    itCli('subcommand --help still prints command syntax help', () => {
      const out = chub(['search', '--help']);
      expect(out).toContain('Usage: chub search');
      expect(out).toContain('--lang <language>');
    });

    itCli('does not accept help operands for subcommand help', () => {
      const out = chub(['help', 'search'], {
        expectError: true,
        env: {
          CHUB_HELP_URL: 'off',
        },
      });

      expect(out).toContain('Unexpected operand for help');
      expect(out).toContain('chub <command> --help');
    });

    itCli('does not let help operands bypass validation with --help', () => {
      const out = chub(['help', 'search', '--help'], {
        expectError: true,
        env: {
          CHUB_HELP_URL: 'off',
        },
      });

      expect(out).toContain('Unexpected operand for help');
      expect(out).toContain('chub <command> --help');
    });

  });

  describe('get', () => {
    itCli('fetches single-language doc with --lang', () => {
      const out = chub(['get', 'acme/widgets', '--lang', 'js']);
      expect(out).toContain('# Acme Widgets API');
      expect(out).toContain('npm install @acme/widgets');
    });

    itCli('errors on single-lang doc without --lang', () => {
      const out = chub(['get', 'acme/widgets'], { expectError: true });
      expect(out).toContain('--lang');
    });

    itCli('fetches multi-language doc with --lang', () => {
      const out = chub(['get', 'multilang/client', '--lang', 'py']);
      expect(out).toContain('# Multilang Client — Python');
      expect(out).toContain('from multilang import Client');
    });

    itCli('fetches js variant with --lang js', () => {
      const out = chub(['get', 'multilang/client', '--lang', 'js']);
      expect(out).toContain('# Multilang Client — JavaScript');
      expect(out).toContain("import { Client } from 'multilang'");
    });

    itCli('errors on multi-lang without --lang', () => {
      const out = chub(['get', 'multilang/client'], { expectError: true });
      expect(out).toContain('Multiple languages');
      expect(out).toContain('--lang');
    });

    itCli('errors on nonexistent entry', () => {
      const out = chub(['get', 'fake/thing'], { expectError: true });
      expect(out).toContain('No doc or skill found');
    });

    itCli('fetches --full with all files', () => {
      const out = chub(['get', 'acme/widgets', '--lang', 'js', '--full']);
      expect(out).toContain('FILE: DOC.md');
      expect(out).toContain('FILE: references/advanced.md');
      expect(out).toContain('Batch Operations');
    });

    itCli('writes to file with -o', () => {
      const tmpFile = join(BUILD_OUTPUT, '_test_output.md');
      chub(['get', 'acme/widgets', '--lang', 'js', '-o', tmpFile]);
      expect(existsSync(tmpFile)).toBe(true);
      const content = readFileSync(tmpFile, 'utf8');
      expect(content).toContain('# Acme Widgets API');
      rmSync(tmpFile, { force: true });
    });

    itCli('fetches skill content', () => {
      const out = chub(['get', 'testskills/deploy']);
      expect(out).toContain('# Deploy Skill');
      expect(out).toContain('Automate deployments');
    });

    itCli('shows footer with additional files when they exist', () => {
      const out = chub(['get', 'acme/widgets', '--lang', 'js']);
      expect(out).toContain('Additional files available');
      expect(out).toContain('references/advanced.md');
      expect(out).toContain('--file');
    });

    itCli('no footer when entry has only one file', () => {
      const out = chub(['get', 'multilang/client', '--lang', 'js']);
      expect(out).not.toContain('Additional files available');
    });

    itCli('fetches specific file with --file', () => {
      const out = chub(['get', 'acme/widgets', '--lang', 'js', '--file', 'references/advanced.md']);
      expect(out).toContain('Batch Operations');
      expect(out).not.toContain('# Acme Widgets API');
    });

    itCli('errors on nonexistent --file with available list', () => {
      const out = chub(['get', 'acme/widgets', '--lang', 'js', '--file', 'nonexistent.md'], { expectError: true });
      expect(out).toContain('not found in acme/widgets');
      expect(out).toContain('references/advanced.md');
    });

    itCli('--json includes additionalFiles array', () => {
      const data = chubJSON(['get', 'acme/widgets', '--lang', 'js']);
      expect(data.additionalFiles).toContain('references/advanced.md');
    });

    itCli('--json omits additionalFiles when none exist', () => {
      const data = chubJSON(['get', 'multilang/client', '--lang', 'js']);
      expect(data.additionalFiles).toBeUndefined();
    });

    // Multi-version tests
    itCli('build groups multi-version docs correctly', () => {
      const reg = JSON.parse(readFileSync(join(BUILD_OUTPUT, 'registry.json'), 'utf8'));
      const doc = reg.docs.find((d) => d.id === 'acme/versioned-api');
      expect(doc).toBeDefined();
      const jsLang = doc.languages.find((l) => l.language === 'javascript');
      expect(jsLang.versions.length).toBe(2);
      expect(jsLang.versions.map((v) => v.version)).toContain('2.0.0');
      expect(jsLang.versions.map((v) => v.version)).toContain('1.0.0');
      expect(jsLang.recommendedVersion).toBe('2.0.0');
    });

    itCli('fetches recommended (latest) version by default', () => {
      const out = chub(['get', 'acme/versioned-api', '--lang', 'js']);
      expect(out).toContain('Versioned API v2');
      expect(out).toContain('version 2.0.0');
    });

    itCli('fetches specific version with --version', () => {
      const out = chub(['get', 'acme/versioned-api', '--lang', 'js', '--version', '1.0.0']);
      expect(out).toContain('Versioned API v1');
      expect(out).toContain('version 1.0.0');
    });

    itCli('errors on nonexistent version with available list', () => {
      const out = chub(['get', 'acme/versioned-api', '--lang', 'js', '--version', '99.0.0'], { expectError: true });
      expect(out).toContain('Version "99.0.0" not found');
      expect(out).toContain('2.0.0');
      expect(out).toContain('1.0.0');
    });
  });

  describe('annotate', () => {
    itCli('saves and displays annotation on get', () => {
      chub(['annotate', 'acme/widgets', 'Use batch mode for large datasets']);
      const out = chub(['get', 'acme/widgets', '--lang', 'js']);
      expect(out).toContain('Agent note');
      expect(out).toContain('Use batch mode for large datasets');
    });

    itCli('replaces annotation on re-annotate', () => {
      chub(['annotate', 'acme/widgets', 'Updated: use streaming instead']);
      const out = chub(['get', 'acme/widgets', '--lang', 'js']);
      expect(out).toContain('use streaming instead');
      expect(out).not.toContain('batch mode');
    });

    itCli('shows annotation with chub annotate <id> (no note)', () => {
      const out = chub(['annotate', 'acme/widgets']);
      expect(out).toContain('use streaming instead');
    });

    itCli('clears annotation', () => {
      chub(['annotate', 'acme/widgets', '--clear']);
      const out = chub(['get', 'acme/widgets', '--lang', 'js']);
      expect(out).not.toContain('Agent note');
    });

    itCli('no annotation section when none set', () => {
      const out = chub(['get', 'multilang/client', '--lang', 'js']);
      expect(out).not.toContain('Agent note');
    });

    itCli('--list shows all annotations', () => {
      chub(['annotate', 'acme/widgets', 'Note A']);
      chub(['annotate', 'multilang/client', 'Note B']);
      const data = chubJSON(['annotate', '--list']);
      expect(data.length).toBe(2);
      const ids = data.map((a) => a.id);
      expect(ids).toContain('acme/widgets');
      expect(ids).toContain('multilang/client');
      // Clean up
      chub(['annotate', 'acme/widgets', '--clear']);
      chub(['annotate', 'multilang/client', '--clear']);
    });

    itCli('--json includes annotation in get output', () => {
      chub(['annotate', 'acme/widgets', 'JSON test note']);
      const data = chubJSON(['get', 'acme/widgets', '--lang', 'js']);
      expect(data.annotation).toBeDefined();
      expect(data.annotation.note).toBe('JSON test note');
      expect(data.annotation.id).toBe('acme/widgets');
      // Clean up
      chub(['annotate', 'acme/widgets', '--clear']);
    });

    itCli('--json omits annotation when none set', () => {
      const data = chubJSON(['get', 'acme/widgets', '--lang', 'js']);
      expect(data.annotation).toBeUndefined();
    });
  });

  describe('json output', () => {
    itCli('search --json returns valid JSON with total', () => {
      const data = chubJSON(['search']);
      expect(typeof data.total).toBe('number');
      expect(Array.isArray(data.results)).toBe(true);
    });

    itCli('build --json returns valid JSON', () => {
      const data = chubJSON(['build', FIXTURES, '--validate-only']);
      expect(typeof data.docs).toBe('number');
      expect(typeof data.skills).toBe('number');
    });
  });
});
