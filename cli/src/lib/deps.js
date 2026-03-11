/**
 * Dependency file detection and parsing.
 *
 * Scans the current working directory (or a given path) for known dependency
 * manifests and extracts package names. Supports:
 *
 *   - package.json          (Node.js / JavaScript / TypeScript)
 *   - requirements.txt      (Python / pip)
 *   - pyproject.toml        (Python / Poetry / PEP 621)
 *   - Pipfile               (Python / Pipenv)
 *   - go.mod                (Go)
 *   - Gemfile               (Ruby)
 *   - Cargo.toml            (Rust)
 *
 * Each parser returns an array of { name, ecosystem } objects.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

/**
 * Parse package.json → dependency names.
 */
function parsePackageJson(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const pkg = JSON.parse(raw);
  const deps = new Set();

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg[section]) {
      for (const name of Object.keys(pkg[section])) {
        // Strip npm scope prefix for matching (e.g. @openai/api → openai)
        const bare = name.startsWith('@') ? name.split('/')[0].slice(1) : name;
        deps.add(bare);
        // Also keep the full scoped name for exact matching
        if (bare !== name) deps.add(name);
      }
    }
  }

  return [...deps].map((name) => ({ name, ecosystem: 'npm' }));
}

/**
 * Parse requirements.txt → dependency names.
 * Handles: name, name==ver, name>=ver, name[extra], -r includes, comments, etc.
 */
function parseRequirementsTxt(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const deps = new Set();

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('-')) continue;

    // Extract package name (before any version specifier, extras, or markers)
    const match = line.match(/^([A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?)/);
    if (match) {
      // Normalize: PEP 503 says underscores, hyphens, and dots are equivalent
      const normalized = match[1].toLowerCase().replace(/[-_.]+/g, '-');
      deps.add(normalized);
    }
  }

  return [...deps].map((name) => ({ name, ecosystem: 'pypi' }));
}

/**
 * Parse pyproject.toml → dependency names.
 * Lightweight parser — handles [project] dependencies and [tool.poetry.dependencies].
 * Does not import a full TOML library to keep chub dependency-free.
 */
function parsePyprojectToml(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const deps = new Set();

  // PEP 621: dependencies = ["openai>=1.0", "stripe"]
  const depsMatch = raw.match(/\bdependencies\s*=\s*\[([\s\S]*?)\]/);
  if (depsMatch) {
    const items = depsMatch[1].match(/"([^"]+)"|'([^']+)'/g) || [];
    for (const item of items) {
      const clean = item.replace(/["']/g, '');
      const name = clean.match(/^([A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?)/);
      if (name) deps.add(name[1].toLowerCase().replace(/[-_.]+/g, '-'));
    }
  }

  // Poetry: [tool.poetry.dependencies] section
  const poetrySection = raw.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(?=\n\[|$)/);
  if (poetrySection) {
    for (const line of poetrySection[1].split('\n')) {
      const match = line.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)\s*=/);
      if (match && match[1].toLowerCase() !== 'python') {
        deps.add(match[1].toLowerCase().replace(/[-_.]+/g, '-'));
      }
    }
  }

  return [...deps].map((name) => ({ name, ecosystem: 'pypi' }));
}

/**
 * Parse Pipfile → dependency names.
 */
function parsePipfile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const deps = new Set();

  // Match lines under [packages] and [dev-packages] sections
  let inSection = false;
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (/^\[(packages|dev-packages)\]/.test(trimmed)) {
      inSection = true;
      continue;
    }
    if (/^\[/.test(trimmed)) {
      inSection = false;
      continue;
    }
    if (inSection) {
      const match = trimmed.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)\s*=/);
      if (match) {
        deps.add(match[1].toLowerCase().replace(/[-_.]+/g, '-'));
      }
    }
  }

  return [...deps].map((name) => ({ name, ecosystem: 'pypi' }));
}

/**
 * Parse go.mod → dependency names.
 * Extracts the last segment of the module path (e.g. github.com/stripe/stripe-go → stripe-go).
 */
function parseGoMod(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const deps = new Set();

  // Match lines inside require ( ... ) block and standalone require lines
  const requireBlock = raw.match(/require\s*\(([\s\S]*?)\)/);
  const lines = requireBlock ? requireBlock[1].split('\n') : [];

  // Also match standalone: require github.com/foo/bar v1.0.0
  for (const rawLine of raw.split('\n')) {
    const match = rawLine.match(/^\s*require\s+([\S]+)/);
    if (match) lines.push(match[1]);
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts[0]) {
      const segments = parts[0].split('/');
      // Skip version suffixes like /v2, /v76
      const meaningful = segments.filter((s) => !/^v\d+$/.test(s));
      const last = meaningful[meaningful.length - 1];
      if (last) deps.add(last);
      // Also try the org name (e.g. stripe from github.com/stripe/stripe-go)
      if (meaningful.length >= 2) {
        deps.add(meaningful[meaningful.length - 2]);
      }
    }
  }

  return [...deps].map((name) => ({ name, ecosystem: 'go' }));
}

/**
 * Parse Gemfile → dependency names.
 */
function parseGemfile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const deps = new Set();

  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*gem\s+['"]([^'"]+)['"]/);
    if (match) deps.add(match[1]);
  }

  return [...deps].map((name) => ({ name, ecosystem: 'rubygems' }));
}

/**
 * Parse Cargo.toml → dependency names.
 */
function parseCargoToml(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const deps = new Set();

  let inDeps = false;
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (/^\[(.*dependencies.*)\]/.test(trimmed)) {
      inDeps = true;
      continue;
    }
    if (/^\[/.test(trimmed)) {
      inDeps = false;
      continue;
    }
    if (inDeps) {
      const match = trimmed.match(/^([A-Za-z0-9][A-Za-z0-9_-]*)\s*=/);
      if (match) deps.add(match[1]);
    }
  }

  return [...deps].map((name) => ({ name, ecosystem: 'crates' }));
}

// Manifest file → parser mapping
const PARSERS = [
  { file: 'package.json', parse: parsePackageJson },
  { file: 'requirements.txt', parse: parseRequirementsTxt },
  { file: 'pyproject.toml', parse: parsePyprojectToml },
  { file: 'Pipfile', parse: parsePipfile },
  { file: 'go.mod', parse: parseGoMod },
  { file: 'Gemfile', parse: parseGemfile },
  { file: 'Cargo.toml', parse: parseCargoToml },
];

/**
 * Detect which dependency files exist in a directory.
 * Returns array of { file, path } for each manifest found.
 */
export function detectManifests(dir) {
  const found = [];
  for (const { file } of PARSERS) {
    const fullPath = join(dir, file);
    if (existsSync(fullPath)) {
      found.push({ file, path: fullPath });
    }
  }
  return found;
}

/**
 * Parse all dependency files in a directory.
 * Returns { manifests: [...], dependencies: [...] } where dependencies is
 * deduplicated by name with ecosystem info.
 */
export function parseDependencies(dir) {
  const manifests = detectManifests(dir);
  const depMap = new Map();

  for (const manifest of manifests) {
    const parser = PARSERS.find((p) => p.file === manifest.file);
    if (!parser) continue;

    try {
      const deps = parser.parse(manifest.path);
      for (const dep of deps) {
        if (!depMap.has(dep.name)) {
          depMap.set(dep.name, { name: dep.name, ecosystem: dep.ecosystem, from: manifest.file });
        }
      }
    } catch (err) {
      // Skip unparseable files — don't crash the scan
      manifests.find((m) => m.file === manifest.file)._error = err.message;
    }
  }

  return {
    manifests: manifests.map((m) => ({ file: m.file, error: m._error || undefined })),
    dependencies: [...depMap.values()],
  };
}
