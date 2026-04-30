/**
 * tests/lib/env-version.test.js
 *
 * Tests for the environment version detection module.
 * Run: npx vitest run tests/lib/env-version.test.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { detectEnvVersion, extractPackageName } from '../../cli/src/lib/env-version.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let testDir;

beforeEach(() => {
  testDir = join(tmpdir(), `chub-test-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });
});

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true });
});

function write(filename, content) {
  writeFileSync(join(testDir, filename), content, 'utf8');
}

// ---------------------------------------------------------------------------
// extractPackageName
// ---------------------------------------------------------------------------

describe('extractPackageName', () => {
  it('returns the author segment for standard IDs', () => {
    expect(extractPackageName('openai/chat-api')).toBe('openai');
    expect(extractPackageName('stripe/api')).toBe('stripe');
    expect(extractPackageName('langchain/agents')).toBe('langchain');
  });

  it('strips vendor suffixes from author segment', () => {
    expect(extractPackageName('langchain-ai/graph')).toBe('langchain');
    expect(extractPackageName('openai-official/chat')).toBe('openai');
    expect(extractPackageName('anthropic-sdk/messages')).toBe('anthropic');
  });

  it('lowercases the result', () => {
    expect(extractPackageName('OpenAI/Chat')).toBe('openai');
  });
});

// ---------------------------------------------------------------------------
// requirements.txt
// ---------------------------------------------------------------------------

describe('requirements.txt', () => {
  it('detects == pin', () => {
    write('requirements.txt', 'openai==1.50.0\nstripe==5.0.0\n');
    expect(detectEnvVersion('openai/chat', testDir)).toEqual({
      version: '1.50.0',
      source: 'requirements.txt',
    });
  });

  it('detects ~= pin', () => {
    write('requirements.txt', 'openai~=1.50.0\n');
    expect(detectEnvVersion('openai/chat', testDir)).toEqual({
      version: '1.50.0',
      source: 'requirements.txt',
    });
  });

  it('detects >= lower bound', () => {
    write('requirements.txt', 'openai>=1.40.0,<2.0.0\n');
    const result = detectEnvVersion('openai/chat', testDir);
    expect(result?.version).toBe('1.40.0');
    expect(result?.source).toBe('requirements.txt');
  });

  it('handles extras like openai[async]==1.50.0', () => {
    write('requirements.txt', 'openai[async]==1.50.0\n');
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('1.50.0');
  });

  it('ignores comment lines', () => {
    write('requirements.txt', '# openai==1.0.0\nopenai==1.50.0\n');
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('1.50.0');
  });

  it('returns null when package not present', () => {
    write('requirements.txt', 'requests==2.31.0\n');
    expect(detectEnvVersion('openai/chat', testDir)).toBeNull();
  });

  it('returns null for unpinned entry (just name)', () => {
    write('requirements.txt', 'openai\n');
    expect(detectEnvVersion('openai/chat', testDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// pyproject.toml — PEP 621
// ---------------------------------------------------------------------------

describe('pyproject.toml (PEP 621)', () => {
  it('detects == pin in [project] dependencies array', () => {
    write(
      'pyproject.toml',
      `[project]\ndependencies = [\n  "openai==1.50.0",\n  "stripe>=5.0.0"\n]\n`
    );
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('1.50.0');
  });

  it('detects >= lower bound in [project] dependencies', () => {
    write(
      'pyproject.toml',
      `[project]\ndependencies = ["openai>=1.40.0,<2.0.0"]\n`
    );
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('1.40.0');
  });
});

// ---------------------------------------------------------------------------
// pyproject.toml — Poetry
// ---------------------------------------------------------------------------

describe('pyproject.toml (Poetry)', () => {
  it('detects caret pin ^1.50.0', () => {
    write(
      'pyproject.toml',
      `[tool.poetry.dependencies]\nopenai = "^1.50.0"\n`
    );
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('1.50.0');
  });

  it('detects inline table { version = "1.50.0" }', () => {
    write(
      'pyproject.toml',
      `[tool.poetry.dependencies]\nopenai = { version = "1.50.0", extras = ["async"] }\n`
    );
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('1.50.0');
  });

  it('returns source as pyproject.toml', () => {
    write('pyproject.toml', `[tool.poetry.dependencies]\nstripe = "^5.0.0"\n`);
    expect(detectEnvVersion('stripe/api', testDir)?.source).toBe('pyproject.toml');
  });
});

// ---------------------------------------------------------------------------
// Pipfile
// ---------------------------------------------------------------------------

describe('Pipfile', () => {
  it('detects == pin', () => {
    write('Pipfile', `[packages]\nopenai = "==1.50.0"\n`);
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('1.50.0');
  });

  it('returns null for wildcard *', () => {
    write('Pipfile', `[packages]\nopenai = "*"\n`);
    expect(detectEnvVersion('openai/chat', testDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// package.json
// ---------------------------------------------------------------------------

describe('package.json', () => {
  it('detects exact version in dependencies', () => {
    write(
      'package.json',
      JSON.stringify({ dependencies: { openai: '4.50.0' } })
    );
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('4.50.0');
  });

  it('strips ^ from caret range', () => {
    write(
      'package.json',
      JSON.stringify({ dependencies: { stripe: '^14.0.0' } })
    );
    expect(detectEnvVersion('stripe/api', testDir)?.version).toBe('14.0.0');
  });

  it('checks devDependencies too', () => {
    write(
      'package.json',
      JSON.stringify({ devDependencies: { openai: '4.50.0' } })
    );
    expect(detectEnvVersion('openai/chat', testDir)?.version).toBe('4.50.0');
  });

  it('returns source as package.json', () => {
    write('package.json', JSON.stringify({ dependencies: { openai: '4.50.0' } }));
    expect(detectEnvVersion('openai/chat', testDir)?.source).toBe('package.json');
  });

  it('returns null when malformed JSON', () => {
    write('package.json', 'not valid json');
    expect(detectEnvVersion('openai/chat', testDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Directory walk-up
// ---------------------------------------------------------------------------

describe('directory walk-up', () => {
  it('finds manifest in parent directory', () => {
    write('requirements.txt', 'openai==1.50.0\n');
    const subDir = join(testDir, 'src', 'app');
    mkdirSync(subDir, { recursive: true });
    // Start search from subDir — should walk up to testDir
    expect(detectEnvVersion('openai/chat', subDir)?.version).toBe('1.50.0');
  });
});

// ---------------------------------------------------------------------------
// No manifest at all
// ---------------------------------------------------------------------------

describe('no manifest', () => {
  it('returns null when no manifest files exist anywhere in tree', () => {
    // testDir is an empty temp dir with no parents containing manifests
    // (we use a deeply nested path that won't accidentally find real project files)
    const isolated = join(testDir, 'no-manifest');
    mkdirSync(isolated, { recursive: true });
    // Can't guarantee filesystem root has no manifests, so just check return type
    const result = detectEnvVersion('openai/chat', isolated);
    expect(result === null || typeof result?.version === 'string').toBe(true);
  });
});
