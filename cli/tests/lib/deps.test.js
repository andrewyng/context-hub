import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { parseDependencies, detectManifests } from '../../src/lib/deps.js';

const TEST_DIR = join(import.meta.dirname, '..', '..', '.test-scan-fixtures');

function setup() {
  mkdirSync(TEST_DIR, { recursive: true });
}

function cleanup() {
  rmSync(TEST_DIR, { recursive: true, force: true });
}

describe('detectManifests', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('returns empty array for empty directory', () => {
    const result = detectManifests(TEST_DIR);
    expect(result).toEqual([]);
  });

  it('detects package.json', () => {
    writeFileSync(join(TEST_DIR, 'package.json'), '{}');
    const result = detectManifests(TEST_DIR);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('package.json');
  });

  it('detects multiple manifests', () => {
    writeFileSync(join(TEST_DIR, 'package.json'), '{}');
    writeFileSync(join(TEST_DIR, 'requirements.txt'), '');
    const result = detectManifests(TEST_DIR);
    expect(result).toHaveLength(2);
    const files = result.map((m) => m.file);
    expect(files).toContain('package.json');
    expect(files).toContain('requirements.txt');
  });
});

describe('parseDependencies — package.json', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('extracts dependencies from all sections', () => {
    writeFileSync(
      join(TEST_DIR, 'package.json'),
      JSON.stringify({
        dependencies: { openai: '^4.0.0', stripe: '^12.0.0' },
        devDependencies: { vitest: '^1.0.0' },
      })
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('openai');
    expect(names).toContain('stripe');
    expect(names).toContain('vitest');
    expect(dependencies[0].ecosystem).toBe('npm');
  });

  it('handles scoped packages', () => {
    writeFileSync(
      join(TEST_DIR, 'package.json'),
      JSON.stringify({
        dependencies: { '@openai/api': '^1.0.0', '@anthropic-ai/sdk': '^0.20.0' },
      })
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('openai');
    expect(names).toContain('anthropic-ai');
  });

  it('handles empty dependencies', () => {
    writeFileSync(
      join(TEST_DIR, 'package.json'),
      JSON.stringify({ name: 'my-app', version: '1.0.0' })
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    expect(dependencies).toHaveLength(0);
  });
});

describe('parseDependencies — requirements.txt', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('extracts package names with version specifiers', () => {
    writeFileSync(
      join(TEST_DIR, 'requirements.txt'),
      'openai>=1.0.0\nstripe==7.0.0\nflask\n'
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('openai');
    expect(names).toContain('stripe');
    expect(names).toContain('flask');
    expect(dependencies[0].ecosystem).toBe('pypi');
  });

  it('skips comments and flags', () => {
    writeFileSync(
      join(TEST_DIR, 'requirements.txt'),
      '# This is a comment\n-r other.txt\nopenai>=1.0\n--extra-index-url http://example.com\n'
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    expect(dependencies).toHaveLength(1);
    expect(dependencies[0].name).toBe('openai');
  });

  it('normalizes package names (PEP 503)', () => {
    writeFileSync(
      join(TEST_DIR, 'requirements.txt'),
      'Pinecone_Client>=2.0\nHugging-Face.Hub\n'
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('pinecone-client');
    expect(names).toContain('hugging-face-hub');
  });
});

describe('parseDependencies — pyproject.toml', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('extracts PEP 621 dependencies', () => {
    writeFileSync(
      join(TEST_DIR, 'pyproject.toml'),
      `
[project]
name = "my-app"
dependencies = [
  "openai>=1.0",
  "stripe",
  "anthropic>=0.20",
]
`
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('openai');
    expect(names).toContain('stripe');
    expect(names).toContain('anthropic');
  });

  it('extracts Poetry dependencies', () => {
    writeFileSync(
      join(TEST_DIR, 'pyproject.toml'),
      `
[tool.poetry.dependencies]
python = "^3.11"
openai = "^1.0"
pinecone-client = "^3.0"
`
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('openai');
    expect(names).toContain('pinecone-client');
    expect(names).not.toContain('python');
  });
});

describe('parseDependencies — Pipfile', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('extracts packages from both sections', () => {
    writeFileSync(
      join(TEST_DIR, 'Pipfile'),
      `
[packages]
openai = ">=1.0"
stripe = "*"

[dev-packages]
pytest = "*"
`
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('openai');
    expect(names).toContain('stripe');
    expect(names).toContain('pytest');
  });
});

describe('parseDependencies — go.mod', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('extracts module names from require block', () => {
    writeFileSync(
      join(TEST_DIR, 'go.mod'),
      `
module myapp

go 1.21

require (
    github.com/stripe/stripe-go/v76 v76.0.0
    github.com/redis/go-redis/v9 v9.0.0
)
`
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('stripe');
    expect(names).toContain('redis');
  });
});

describe('parseDependencies — Gemfile', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('extracts gem names', () => {
    writeFileSync(
      join(TEST_DIR, 'Gemfile'),
      `
source 'https://rubygems.org'

gem 'stripe'
gem 'redis', '~> 5.0'
`
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('stripe');
    expect(names).toContain('redis');
    expect(dependencies[0].ecosystem).toBe('rubygems');
  });
});

describe('parseDependencies — Cargo.toml', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('extracts crate names from dependencies', () => {
    writeFileSync(
      join(TEST_DIR, 'Cargo.toml'),
      `
[package]
name = "my-app"

[dependencies]
serde = "1.0"
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
criterion = "0.5"
`
    );
    const { dependencies } = parseDependencies(TEST_DIR);
    const names = dependencies.map((d) => d.name);
    expect(names).toContain('serde');
    expect(names).toContain('tokio');
    expect(names).toContain('criterion');
    expect(dependencies[0].ecosystem).toBe('crates');
  });
});

describe('parseDependencies — multi-manifest', () => {
  beforeEach(setup);
  afterEach(cleanup);

  it('deduplicates across manifests', () => {
    writeFileSync(
      join(TEST_DIR, 'package.json'),
      JSON.stringify({ dependencies: { openai: '^4.0' } })
    );
    writeFileSync(join(TEST_DIR, 'requirements.txt'), 'openai>=1.0\n');
    const { manifests, dependencies } = parseDependencies(TEST_DIR);
    expect(manifests).toHaveLength(2);
    // Should have openai once from package.json (first seen) plus once from requirements.txt
    // Actually dedup by name means the pip 'openai' matches the existing npm 'openai', so only one
    const openaiDeps = dependencies.filter((d) => d.name === 'openai');
    expect(openaiDeps).toHaveLength(1);
  });

  it('handles parse errors gracefully', () => {
    writeFileSync(join(TEST_DIR, 'package.json'), 'NOT VALID JSON');
    const { manifests, dependencies } = parseDependencies(TEST_DIR);
    expect(manifests).toHaveLength(1);
    expect(manifests[0].error).toBeDefined();
    expect(dependencies).toHaveLength(0);
  });
});
