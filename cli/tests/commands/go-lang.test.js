/**
 * Tests for `--lang go` support in context-hub.
 *
 * Covers:
 *  1. content/openai/docs/chat/go/DOC.md — frontmatter correctness
 *  2. resolveDocPath() — correctly resolves a Go language entry
 *  3. resolveDocPath() — returns error for unknown language
 *  4. chub build — validates the Go fixture via CLI
 *  5. chub build --validate-only --json — Go fixture counts as a doc language variant
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { parseFrontmatter } from '../../src/lib/frontmatter.js';
import { resolveDocPath } from '../../src/lib/registry.js';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');
const CLI_BIN = join(import.meta.dirname, '..', '..', 'bin', 'chub');
const FIXTURES = join(import.meta.dirname, '..', '..', 'test', 'fixtures');
const GO_DOC_PATH = join(REPO_ROOT, 'content', 'openai', 'docs', 'chat', 'go', 'DOC.md');
const GO_FIXTURE_PATH = join(FIXTURES, 'multilang', 'docs', 'client', 'go', 'DOC.md');
const BUILD_TEST_TIMEOUT = 15000;
const itBuild = (name, fn) => it(name, { timeout: BUILD_TEST_TIMEOUT }, fn);
const TEST_ENV = { ...process.env, CHUB_TELEMETRY: '0', CHUB_FEEDBACK: '0' };

// ---------------------------------------------------------------------------
// 1. Content file — frontmatter validation
// ---------------------------------------------------------------------------
describe('content/openai/docs/chat/go/DOC.md — frontmatter', () => {
  it('file exists and is readable', () => {
    const raw = readFileSync(GO_DOC_PATH, 'utf8');
    expect(raw.length).toBeGreaterThan(100);
  });

  it('has required name field equal to "chat"', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    expect(attributes.name).toBe('chat');
  });

  it('has required description field', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    expect(typeof attributes.description).toBe('string');
    expect(attributes.description.length).toBeGreaterThan(10);
  });

  it('declares language as "go"', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    expect(attributes.metadata.languages).toBe('go');
  });

  it('has a versions field (SDK version string)', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    expect(typeof attributes.metadata.versions).toBe('string');
    expect(attributes.metadata.versions.length).toBeGreaterThan(0);
  });

  it('has an updated-on date in YYYY-MM-DD format', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    expect(attributes.metadata['updated-on']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('has a valid source value', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    const validSources = ['official', 'maintainer', 'community'];
    expect(validSources).toContain(attributes.metadata.source);
  });

  it('has tags including "go" or "openai"', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    const tags = attributes.metadata.tags || '';
    expect(tags).toMatch(/openai|go/);
  });

  it('body contains openai.F() — the critical Go SDK pattern', () => {
    const { body } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    expect(body).toContain('openai.F(');
  });

  it('body contains go import statement', () => {
    const { body } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    expect(body).toContain('github.com/openai/openai-go');
  });

  it('body contains a code block', () => {
    const { body } = parseFrontmatter(readFileSync(GO_DOC_PATH, 'utf8'));
    expect(body).toContain('```go');
  });
});

// ---------------------------------------------------------------------------
// 2. Go fixture — frontmatter validation
// ---------------------------------------------------------------------------
describe('test fixture: multilang/docs/client/go/DOC.md', () => {
  it('fixture file exists', () => {
    const raw = readFileSync(GO_FIXTURE_PATH, 'utf8');
    expect(raw.length).toBeGreaterThan(0);
  });

  it('fixture name matches sibling variants (must be "client")', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_FIXTURE_PATH, 'utf8'));
    expect(attributes.name).toBe('client');
  });

  it('fixture declares language "go"', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_FIXTURE_PATH, 'utf8'));
    expect(attributes.metadata.languages).toBe('go');
  });

  it('fixture has same description as python/js variants', () => {
    const { attributes } = parseFrontmatter(readFileSync(GO_FIXTURE_PATH, 'utf8'));
    expect(attributes.description).toBe('Multilang client SDK');
  });
});

// ---------------------------------------------------------------------------
// 3. resolveDocPath() — Go language resolution logic
// ---------------------------------------------------------------------------
describe('resolveDocPath() — Go language support', () => {
  const makeEntry = (languages) => ({
    name: 'chat',
    languages,
    _sourceObj: { name: 'default', url: 'https://cdn.example.com/v1' },
  });

  it('resolves "go" language variant when present', () => {
    const entry = makeEntry([
      { language: 'python', versions: [{ version: '2.0', path: 'openai/chat/python', files: ['DOC.md'] }], recommendedVersion: '2.0' },
      { language: 'javascript', versions: [{ version: '6.0', path: 'openai/chat/javascript', files: ['DOC.md'] }], recommendedVersion: '6.0' },
      { language: 'go', versions: [{ version: '1.3.0', path: 'openai/chat/go', files: ['DOC.md'] }], recommendedVersion: '1.3.0' },
    ]);

    const result = resolveDocPath(entry, 'go', null);
    expect(result).not.toBeNull();
    expect(result.path).toBe('openai/chat/go');
    expect(result.files).toContain('DOC.md');
  });

  it('returns needsLanguage when lang is null and multiple languages exist including go', () => {
    const entry = makeEntry([
      { language: 'python', versions: [{ version: '2.0', path: 'p/python', files: ['DOC.md'] }], recommendedVersion: '2.0' },
      { language: 'go', versions: [{ version: '1.3.0', path: 'p/go', files: ['DOC.md'] }], recommendedVersion: '1.3.0' },
    ]);

    const result = resolveDocPath(entry, null, null);
    expect(result).not.toBeNull();
    expect(result.needsLanguage).toBe(true);
    expect(result.available).toContain('go');
    expect(result.available).toContain('python');
  });

  it('returns error-like result when "go" is requested but not available', () => {
    const entry = makeEntry([
      { language: 'python', versions: [{ version: '2.0', path: 'p/python', files: ['DOC.md'] }], recommendedVersion: '2.0' },
      { language: 'javascript', versions: [{ version: '6.0', path: 'p/js', files: ['DOC.md'] }], recommendedVersion: '6.0' },
    ]);

    const result = resolveDocPath(entry, 'go', null);
    // Should return null or a languageNotFound indicator — not a valid path
    if (result !== null) {
      expect(result.path).toBeUndefined();
    } else {
      expect(result).toBeNull();
    }
  });

  it('resolves "go" at a specific version', () => {
    const entry = makeEntry([
      {
        language: 'go',
        versions: [
          { version: '1.3.0', path: 'openai/chat/go', files: ['DOC.md'] },
          { version: '1.0.0', path: 'openai/chat/go-v1', files: ['DOC.md'] },
        ],
        recommendedVersion: '1.3.0',
      },
    ]);

    const result = resolveDocPath(entry, 'go', '1.0.0');
    expect(result).not.toBeNull();
    expect(result.path).toBe('openai/chat/go-v1');
  });

  it('resolves recommended version when lang=go and version=null', () => {
    const entry = makeEntry([
      {
        language: 'go',
        versions: [
          { version: '1.3.0', path: 'openai/chat/go', files: ['DOC.md'] },
          { version: '1.0.0', path: 'openai/chat/go-v1', files: ['DOC.md'] },
        ],
        recommendedVersion: '1.3.0',
      },
    ]);

    const result = resolveDocPath(entry, 'go', null);
    expect(result).not.toBeNull();
    expect(result.path).toBe('openai/chat/go');
  });
});

// ---------------------------------------------------------------------------
// 4. CLI integration — build validates Go fixture without errors
// ---------------------------------------------------------------------------
describe('chub build — Go fixture integration', () => {
  itBuild('validates the multilang fixture (including Go variant) without errors', () => {
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, 'build', FIXTURES, '--validate-only', '--json'],
      { encoding: 'utf8', env: TEST_ENV },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed.warnings).toBe(0);
    expect(parsed.docs).toBeGreaterThanOrEqual(1);
  });

  itBuild('doc count includes Go as part of the multilang entry (not a new doc)', () => {
    // The multilang/client entry now has 3 language variants: python, javascript, go.
    // It should still count as 1 doc entry (language variants share the same name).
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, 'build', FIXTURES, '--validate-only', '--json'],
      { encoding: 'utf8', env: TEST_ENV },
    );

    const parsed = JSON.parse(result.trim());
    // 3 doc entries: acme/widgets, acme/versioned-api, multilang/client (with py+js+go)
    expect(parsed.docs).toBe(3);
  });

  itBuild('exits cleanly (exit code 0) with Go fixture present', () => {
    let threw = false;
    try {
      execFileSync(
        process.execPath,
        [CLI_BIN, 'build', FIXTURES, '--validate-only'],
        { encoding: 'utf8', stdio: 'pipe', env: TEST_ENV },
      );
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Build → registry round-trip: go appears in built registry.json
// ---------------------------------------------------------------------------
describe('chub build — Go appears in built registry.json', () => {
  itBuild('go language is present in registry after building content/', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'chub-go-test-'));

    execFileSync(
      process.execPath,
      [CLI_BIN, 'build', join(REPO_ROOT, 'content'), '-o', tmpDir],
      { encoding: 'utf8', env: TEST_ENV },
    );

    const registry = JSON.parse(readFileSync(join(tmpDir, 'registry.json'), 'utf8'));
    const chat = registry.docs.find((d) => d.id === 'openai/chat');
    expect(chat).toBeDefined();
    const langs = chat.languages.map((l) => l.language);
    expect(langs).toContain('go');
  });
});
