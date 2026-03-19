/**
 * env-version.js
 *
 * Detects the version of a package pinned in the current project's
 * dependency files, so `chub get` can auto-select the right doc version
 * without the user having to pass --version explicitly.
 *
 * Supported manifests (searched in cwd, then walking up to fs root):
 *   Python : requirements.txt, pyproject.toml, Pipfile
 *   Node   : package.json, package-lock.json
 *
 * Returns the first exact version found, or null if none.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Given a context-hub entry ID (e.g. "openai/chat", "stripe/api"),
 * extract the package name and search local manifests for a pinned version.
 *
 * @param {string} entryId   - context-hub doc ID, e.g. "openai/chat-api"
 * @param {string} [cwd]     - starting directory (default: process.cwd())
 * @returns {{ version: string, source: string } | null}
 *   version — cleaned semver string e.g. "1.50.0"
 *   source  — which file it came from e.g. "requirements.txt"
 */
export function detectEnvVersion(entryId, cwd = process.cwd()) {
  const packageName = extractPackageName(entryId);
  const manifestDir = findManifestDir(cwd);
  if (!manifestDir) return null;

  return (
    fromRequirementsTxt(manifestDir, packageName) ||
    fromPyprojectToml(manifestDir, packageName) ||
    fromPipfile(manifestDir, packageName) ||
    fromPackageJson(manifestDir, packageName) ||
    fromPackageLockJson(manifestDir, packageName) ||
    null
  );
}

// ---------------------------------------------------------------------------
// Package name extraction
// ---------------------------------------------------------------------------

/**
 * Derive a likely package/library name from a context-hub entry ID.
 *
 * Context-hub IDs follow the pattern  author/entry-name  where author is
 * usually the package publisher (e.g. "openai", "stripe", "langchain").
 * The author segment is the best proxy for the actual package name.
 *
 * Examples:
 *   "openai/chat-api"     → "openai"
 *   "stripe/api"          → "stripe"
 *   "langchain/agents"    → "langchain"
 *   "langchain-ai/graph"  → "langchain"   (strip vendor suffixes)
 */
export function extractPackageName(entryId) {
  const author = entryId.split('/')[0].toLowerCase();
  // Strip common vendor suffixes that don't appear in the pip/npm package name
  return author.replace(/[-_](ai|official|community|dev|sdk|io)$/, '');
}

// ---------------------------------------------------------------------------
// Manifest directory discovery (walk up from cwd)
// ---------------------------------------------------------------------------

const MANIFEST_FILES = [
  'requirements.txt',
  'pyproject.toml',
  'Pipfile',
  'package.json',
];

function findManifestDir(startDir) {
  let dir = startDir;
  while (true) {
    if (MANIFEST_FILES.some((f) => existsSync(join(dir, f)))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return null; // reached fs root
    dir = parent;
  }
}

// ---------------------------------------------------------------------------
// Parser: requirements.txt
// ---------------------------------------------------------------------------

/**
 * Handles common pin formats:
 *   openai==1.50.0
 *   openai>=1.0.0,<2.0.0   → picks the lower bound
 *   openai~=1.50.0          → treated as exact
 *   openai[async]==1.50.0   → extras stripped
 */
function fromRequirementsTxt(dir, packageName) {
  const file = join(dir, 'requirements.txt');
  if (!existsSync(file)) return null;

  const lines = readFileSync(file, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('-')) continue;

    // Strip extras like openai[async]
    const normalized = line.replace(/\[.*?\]/, '');
    const name = normalized.split(/[=<>!~;]/)[0].trim().toLowerCase();

    if (name !== packageName) continue;

    // Extract first version number after ==, ~=, or >=
    const match = normalized.match(/[=~]=\s*([\d][^\s,;]*)/);
    if (match) {
      return { version: cleanVersion(match[1]), source: 'requirements.txt' };
    }
    // >=1.0.0 — use lower bound
    const geMatch = normalized.match(/>=([\d][^\s,;]*)/);
    if (geMatch) {
      return { version: cleanVersion(geMatch[1]), source: 'requirements.txt' };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Parser: pyproject.toml
// ---------------------------------------------------------------------------

/**
 * Handles PEP 621 [project] and Poetry [tool.poetry.dependencies] sections.
 *
 * PEP 621 example:
 *   [project]
 *   dependencies = ["openai>=1.50.0", "stripe==5.0.0"]
 *
 * Poetry example:
 *   [tool.poetry.dependencies]
 *   openai = "^1.50.0"
 *   stripe = { version = "5.0.0", extras = ["billing"] }
 */
function fromPyprojectToml(dir, packageName) {
  const file = join(dir, 'pyproject.toml');
  if (!existsSync(file)) return null;

  const content = readFileSync(file, 'utf8');

  // PEP 621: dependencies = ["openai>=1.50.0"]
  const pep621Match = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (pep621Match) {
    const deps = pep621Match[1];
    const pkgRe = new RegExp(
      `["']${escapeRegex(packageName)}(?:\\[.*?\\])?\\s*([^"']+)["']`,
      'i'
    );
    const m = deps.match(pkgRe);
    if (m) {
      const versionMatch = m[1].match(/[=~]=\s*([\d][^\s,;'"]*)/);
      if (versionMatch)
        return { version: cleanVersion(versionMatch[1]), source: 'pyproject.toml' };
      const geMatch = m[1].match(/>=([\d][^\s,;'"]*)/);
      if (geMatch)
        return { version: cleanVersion(geMatch[1]), source: 'pyproject.toml' };
    }
  }

  // Poetry: packagename = "^1.50.0" or packagename = { version = "1.50.0" }
  const poetryRe = new RegExp(
    `^${escapeRegex(packageName)}\\s*=\\s*(.+)$`,
    'im'
  );
  const poetryMatch = content.match(poetryRe);
  if (poetryMatch) {
    const val = poetryMatch[1].trim();
    // Inline table: { version = "1.50.0", ... }
    const inlineVer = val.match(/version\s*=\s*["']([^"']+)["']/);
    if (inlineVer)
      return { version: cleanVersion(inlineVer[1]), source: 'pyproject.toml' };
    // Simple string: "^1.50.0" or ">=1.50.0" or "1.50.0"
    const simpleVer = val.match(/["'^~>=!]*\s*([\d]\S*)["']/);
    if (simpleVer)
      return { version: cleanVersion(simpleVer[1]), source: 'pyproject.toml' };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Parser: Pipfile
// ---------------------------------------------------------------------------

/**
 * [packages]
 * openai = "==1.50.0"
 * stripe = "*"          → skip (unpinned)
 */
function fromPipfile(dir, packageName) {
  const file = join(dir, 'Pipfile');
  if (!existsSync(file)) return null;

  const content = readFileSync(file, 'utf8');
  const re = new RegExp(
    `^${escapeRegex(packageName)}\\s*=\\s*["']([^"'*]+)["']`,
    'im'
  );
  const match = content.match(re);
  if (!match) return null;

  const versionMatch = match[1].match(/[=~]=\s*([\d][^\s,]*)/);
  if (versionMatch)
    return { version: cleanVersion(versionMatch[1]), source: 'Pipfile' };
  const geMatch = match[1].match(/>=([\d][^\s,]*)/);
  if (geMatch)
    return { version: cleanVersion(geMatch[1]), source: 'Pipfile' };

  return null;
}

// ---------------------------------------------------------------------------
// Parser: package.json
// ---------------------------------------------------------------------------

/**
 * Checks dependencies and devDependencies.
 * "openai": "^4.0.0"   → "4.0.0"
 * "openai": "4.0.0"    → "4.0.0"
 */
function fromPackageJson(dir, packageName) {
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return null;

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };

  // Try exact name and @scoped variants e.g. @langchain/langgraph
  const keys = [
    packageName,
    `@${packageName}/${packageName}`,
    ...Object.keys(allDeps).filter((k) =>
      k.toLowerCase().includes(packageName)
    ),
  ];

  for (const key of keys) {
    const raw = allDeps[key];
    if (!raw) continue;
    const versionMatch = raw.match(/(\d[\d.]+)/);
    if (versionMatch)
      return { version: cleanVersion(versionMatch[1]), source: 'package.json' };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Parser: package-lock.json (more precise — resolved versions)
// ---------------------------------------------------------------------------

function fromPackageLockJson(dir, packageName) {
  const file = join(dir, 'package-lock.json');
  if (!existsSync(file)) return null;

  let lock;
  try {
    lock = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }

  // lockfileVersion 2+: packages["node_modules/openai"].version
  const packages = lock.packages || {};
  for (const [key, val] of Object.entries(packages)) {
    const name = key.replace(/^node_modules\//, '').toLowerCase();
    if (name === packageName || name.endsWith(`/${packageName}`)) {
      if (val.version) {
        return { version: cleanVersion(val.version), source: 'package-lock.json' };
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip leading ^~>= and trailing .* from version strings */
function cleanVersion(raw) {
  return raw.replace(/^[^0-9]+/, '').replace(/\.\*$/, '').trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
