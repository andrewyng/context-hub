import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getChubDir, loadConfig } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Path to bundled content shipped with the npm package.
 * Contains registry.json + doc files built from content/ at publish time.
 */
function getBundledDir() {
  return join(__dirname, '..', '..', 'dist');
}

function getSourceDir(sourceName) {
  return join(getChubDir(), 'sources', sourceName);
}

function getSourceDataDir(sourceName) {
  return join(getSourceDir(sourceName), 'data');
}

function getSourceMetaPath(sourceName) {
  return join(getSourceDir(sourceName), 'meta.json');
}

function getSourceRegistryPath(sourceName) {
  return join(getSourceDir(sourceName), 'registry.json');
}

function getSourceSearchIndexPath(sourceName) {
  return join(getSourceDir(sourceName), 'search-index.json');
}

function readMeta(sourceName) {
  try {
    return JSON.parse(readFileSync(getSourceMetaPath(sourceName), 'utf8'));
  } catch {
    return {};
  }
}

function writeMeta(sourceName, meta) {
  const dir = getSourceDir(sourceName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(getSourceMetaPath(sourceName), JSON.stringify(meta, null, 2));
}

function isSourceCacheFresh(sourceName) {
  const meta = readMeta(sourceName);
  if (!meta.lastUpdated && meta.lastUpdated !== 0) return false;
  const config = loadConfig();
  const age = (Date.now() - meta.lastUpdated) / 1000;
  return age < config.refresh_interval;
}

function isTimestampFresh(timestamp) {
  if (timestamp === undefined || timestamp === null) return false;
  const config = loadConfig();
  const age = (Date.now() - timestamp) / 1000;
  return age < config.refresh_interval;
}

function hasFreshSearchIndexState(sourceName) {
  if (existsSync(getSourceSearchIndexPath(sourceName))) {
    return true;
  }

  const meta = readMeta(sourceName);
  return meta.searchIndexAvailable === false && isTimestampFresh(meta.searchIndexCheckedAt);
}

function shouldFetchRemoteRegistry(sourceName, force = false) {
  if (force) return true;
  return !(
    isSourceCacheFresh(sourceName)
    && existsSync(getSourceRegistryPath(sourceName))
    && hasFreshSearchIndexState(sourceName)
  );
}

async function fetchRemoteText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch registry for a single remote source.
 */
async function fetchRemoteRegistry(source, force = false) {
  if (!shouldFetchRemoteRegistry(source.name, force)) {
    return;
  }

  const registryUrl = `${source.url}/registry.json`;
  let registryText;
  try {
    registryText = await fetchRemoteText(registryUrl);
  } catch (err) {
    throw new Error(`Failed to fetch registry from ${source.name}: ${err.message}`);
  }

  const dir = getSourceDir(source.name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(getSourceRegistryPath(source.name), registryText);

  const searchIndexUrl = `${source.url}/search-index.json`;
  const searchIndexCheckedAt = Date.now();
  let searchIndexAvailable;
  try {
    const searchIndexText = await fetchRemoteText(searchIndexUrl);
    writeFileSync(getSourceSearchIndexPath(source.name), searchIndexText);
    searchIndexAvailable = true;
  } catch (err) {
    // Avoid serving a stale local search index after a registry refresh.
    rmSync(getSourceSearchIndexPath(source.name), { force: true });
    if (err.message?.startsWith('404 ')) {
      searchIndexAvailable = false;
    }
  }

  const nextMeta = {
    ...readMeta(source.name),
    lastUpdated: Date.now(),
  };
  delete nextMeta.searchIndexAvailable;
  delete nextMeta.searchIndexCheckedAt;

  if (searchIndexAvailable !== undefined) {
    nextMeta.searchIndexAvailable = searchIndexAvailable;
    nextMeta.searchIndexCheckedAt = searchIndexCheckedAt;
  }

  writeMeta(source.name, nextMeta);
}

/**
 * Fetch registries for all configured sources.
 */
export async function fetchAllRegistries(force = false) {
  const config = loadConfig();
  const errors = [];

  for (const source of config.sources) {
    if (source.path) continue; // Local sources don't need fetching
    try {
      await fetchRemoteRegistry(source, force);
    } catch (err) {
      errors.push({ source: source.name, error: err.message });
    }
  }

  return errors;
}

/**
 * Download full bundle for a remote source.
 */
export async function fetchFullBundle(sourceName) {
  const config = loadConfig();
  const source = config.sources.find((s) => s.name === sourceName);
  if (!source || source.path) {
    throw new Error(`Source "${sourceName}" is not a remote source.`);
  }

  const url = `${source.url}/bundle.tar.gz`;
  const tmpPath = join(getSourceDir(sourceName), 'bundle.tar.gz');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch bundle from ${sourceName}: ${res.status} ${res.statusText}`);
  }

  const dir = getSourceDir(sourceName);
  mkdirSync(dir, { recursive: true });
  await pipeline(res.body, createWriteStream(tmpPath));

  const { extract } = await import('tar');
  const dataDir = getSourceDataDir(sourceName);
  mkdirSync(dataDir, { recursive: true });
  await extract({ file: tmpPath, cwd: dataDir });

  // Copy registry.json from extracted bundle if present
  const extractedRegistry = join(dataDir, 'registry.json');
  if (existsSync(extractedRegistry)) {
    const regData = readFileSync(extractedRegistry, 'utf8');
    writeFileSync(getSourceRegistryPath(sourceName), regData);
  }

  const extractedSearchIndex = join(dataDir, 'search-index.json');
  if (existsSync(extractedSearchIndex)) {
    const searchIndexData = readFileSync(extractedSearchIndex, 'utf8');
    writeFileSync(getSourceSearchIndexPath(sourceName), searchIndexData);
  } else {
    rmSync(getSourceSearchIndexPath(sourceName), { force: true });
  }

  writeMeta(sourceName, { ...readMeta(sourceName), lastUpdated: Date.now(), fullBundle: true });
  rmSync(tmpPath, { force: true });
}

/**
 * Fetch a single doc. Source object must have name + (url or path).
 */
export async function fetchDoc(source, docPath) {
  // Local source: read directly
  if (source.path) {
    const localPath = join(source.path, docPath);
    // Prevent path traversal for local sources too
    const resolvedLocal = resolve(localPath);
    const resolvedRoot = resolve(source.path);
    if (!resolvedLocal.startsWith(resolvedRoot)) {
      throw new Error(`Security Error: Path traversal detected for local source "${docPath}"`);
    }

    if (!existsSync(localPath)) {
      throw new Error(`File not found: ${localPath}`);
    }
    return readFileSync(localPath, 'utf8');
  }

  const dataDir = getSourceDataDir(source.name);
  const cachedPath = join(dataDir, docPath);

  // Security: Prevent Path Traversal in cache
  const resolvedCache = resolve(cachedPath);
  const resolvedDataDir = resolve(dataDir);
  const rel = relative(resolvedDataDir, resolvedCache);
  if (rel.startsWith('..') || isAbs(rel)) {
    throw new Error(`Security Error: Path traversal detected for doc "${docPath}"`);
  }

  // Remote source: check cache first
  if (existsSync(cachedPath)) {
    return readFileSync(cachedPath, 'utf8');
  }

  // Check bundled content (shipped with npm package)
  const bundledPath = join(getBundledDir(), docPath);
  if (existsSync(bundledPath)) {
    return readFileSync(bundledPath, 'utf8');
  }

  // Fetch from CDN (optional — only if source has a URL)
  const url = `${source.url}/${docPath}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${docPath} from ${source.name}: ${res.status} ${res.statusText}`);
  }

  const content = await res.text();

  // Cache locally
  const dir = dirname(cachedPath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(cachedPath, content);

  return content;
}

// Helper for path check
function isAbs(path) {
  return resolve(path) === resolve(path) && (process.platform === 'win32' || path.startsWith('/'));
}

/**
 * Fetch all files in an entry directory.
 * Returns array of { name, content }.
 */
export async function fetchDocFull(source, basePath, files) {
  const results = [];
  for (const file of files) {
    const filePath = `${basePath}/${file}`;
    const content = await fetchDoc(source, filePath);
    results.push({ name: file, content });
  }
  return results;
}

/**
 * Load cached/local registry for a single source.
 */
export function loadSourceRegistry(source) {
  if (source.path) {
    // Local source: read registry.json from the folder
    const regPath = join(source.path, 'registry.json');
    if (!existsSync(regPath)) return null;
    return JSON.parse(readFileSync(regPath, 'utf8'));
  }

  // Remote source: read from cache
  const regPath = getSourceRegistryPath(source.name);
  if (!existsSync(regPath)) return null;
  return JSON.parse(readFileSync(regPath, 'utf8'));
}

/**
 * Load BM25 search index for a single source (if available).
 */
export function loadSearchIndex(source) {
  const basePath = source.path || getSourceDir(source.name);
  const indexPath = join(basePath, 'search-index.json');
  if (!existsSync(indexPath)) return null;
  try {
    return JSON.parse(readFileSync(indexPath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Get cache stats.
 */
export function getCacheStats() {
  const chubDir = getChubDir();
  if (!existsSync(chubDir)) {
    return { exists: false, sources: [] };
  }

  const config = loadConfig();
  const sourceStats = [];

  for (const source of config.sources) {
    if (source.path) {
      sourceStats.push({ name: source.name, type: 'local', path: source.path });
      continue;
    }

    const meta = readMeta(source.name);
    const dataDir = getSourceDataDir(source.name);
    let dataSize = 0;
    let fileCount = 0;

    if (existsSync(dataDir)) {
      const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else { dataSize += statSync(full).size; fileCount++; }
        }
      };
      walk(dataDir);
    }

    sourceStats.push({
      name: source.name,
      type: 'remote',
      hasRegistry: existsSync(getSourceRegistryPath(source.name)),
      lastUpdated: meta.lastUpdated ? new Date(meta.lastUpdated).toISOString() : null,
      fullBundle: meta.fullBundle || false,
      fileCount,
      dataSize,
    });
  }

  return { exists: true, sources: sourceStats };
}

/**
 * Clear the cache (preserves config.yaml).
 */
export function clearCache() {
  const chubDir = getChubDir();
  const configPath = join(chubDir, 'config.yaml');
  let configContent = null;
  if (existsSync(configPath)) {
    configContent = readFileSync(configPath, 'utf8');
  }

  rmSync(chubDir, { recursive: true, force: true });

  if (configContent) {
    mkdirSync(chubDir, { recursive: true });
    writeFileSync(configPath, configContent);
  }
}

/**
 * Ensure at least one registry is available.
 */
export async function ensureRegistry() {
  const config = loadConfig();

  // Check if any source has a registry available
  let hasAny = false;
  for (const source of config.sources) {
    if (source.path) {
      const regPath = join(source.path, 'registry.json');
      if (existsSync(regPath)) { hasAny = true; break; }
    } else {
      if (existsSync(getSourceRegistryPath(source.name))) { hasAny = true; break; }
    }
  }

  if (hasAny) {
    // Auto-refresh stale remote registries (best-effort)
    for (const source of config.sources) {
      if (source.path) continue;
      if (shouldFetchRemoteRegistry(source.name)) {
        try { await fetchRemoteRegistry(source); } catch { /* use stale */ }
      }
    }
    return;
  }

  // No registries at all — try bundled content first, then network
  const bundledRegistry = join(getBundledDir(), 'registry.json');
  if (existsSync(bundledRegistry)) {
    // Seed cache from bundled content (ships with npm package)
    const defaultDir = getSourceDir('default');
    mkdirSync(defaultDir, { recursive: true });
    writeFileSync(getSourceRegistryPath('default'), readFileSync(bundledRegistry, 'utf8'));
    const bundledSearchIndex = join(getBundledDir(), 'search-index.json');
    if (existsSync(bundledSearchIndex)) {
      writeFileSync(getSourceSearchIndexPath('default'), readFileSync(bundledSearchIndex, 'utf8'));
    }
    writeMeta('default', { lastUpdated: 0, bundledSeed: true }); // lastUpdated=0 → stale, so chub update will refresh
    return;
  }

  // No bundled content either — must download from remote
  await fetchAllRegistries(true);
}
