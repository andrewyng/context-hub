/**
 * REST API request handlers.
 * All upstream interactions go through the adapter layer.
 */

import {
  searchEntries,
  getEntry,
  listEntries,
  resolveDocPath,
  resolveEntryFile,
  fetchDoc,
  fetchDocFull,
  getCacheStats,
  loadConfig,
  getChubDir,
  buildContentTree,
  resetRegistry,
  ensureRegistry,
} from '../adapter.js';

import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { repoPath, REPO_ROOT } from '../lib/paths.js';

function simplifyEntry(entry) {
  const result = {
    id: entry.id,
    name: entry.name,
    type: entry._type || (entry.languages ? 'doc' : 'skill'),
    description: entry.description,
    tags: entry.tags || [],
    source: entry.source,
  };
  if (entry.languages) {
    result.languages = entry.languages.map(l => ({
      language: l.language,
      versions: l.versions?.map(v => v.version) || [],
      recommended: l.recommendedVersion,
    }));
  }
  if (entry.path) result.path = entry.path;
  if (entry._score !== undefined) result.score = entry._score;
  return result;
}

export function handleSearchRequest(req, res) {
  try {
    const { q, tags, lang, limit = '20' } = req.query;
    let entries;
    if (q) {
      entries = searchEntries(q, { tags, lang });
    } else {
      entries = listEntries({ tags, lang });
    }
    const sliced = entries.slice(0, parseInt(limit, 10));
    res.json({ results: sliced.map(simplifyEntry), total: entries.length, showing: sliced.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function handleListEntries(req, res) {
  try {
    const { tags, lang, limit = '50' } = req.query;
    const entries = listEntries({ tags, lang });
    const sliced = entries.slice(0, parseInt(limit, 10));
    res.json({ entries: sliced.map(simplifyEntry), total: entries.length, showing: sliced.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function handleGetEntry(req, res) {
  try {
    const id = `${req.params.author}/${req.params.name}`;
    const result = getEntry(id);

    if (result.ambiguous) {
      return res.status(409).json({ error: 'Ambiguous entry ID', alternatives: result.alternatives });
    }
    if (!result.entry) {
      return res.status(404).json({ error: `Entry "${id}" not found` });
    }

    res.json(simplifyEntry(result.entry));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function handleGetContent(req, res) {
  try {
    const id = `${req.params.author}/${req.params.name}`;
    const { lang, version, file, full } = req.query;

    if (file) {
      const normalizedFile = resolve('/', file).slice(1);
      if (normalizedFile !== file || file.includes('..')) {
        return res.status(400).json({ error: 'Invalid file path — path traversal not allowed' });
      }
    }

    const result = getEntry(id);
    if (result.ambiguous) {
      return res.status(409).json({ error: 'Ambiguous entry ID', alternatives: result.alternatives });
    }
    if (!result.entry) {
      return res.status(404).json({ error: `Entry "${id}" not found` });
    }

    const entry = result.entry;
    const type = entry.languages ? 'doc' : 'skill';
    const resolved = resolveDocPath(entry, lang, version);

    if (!resolved) {
      return res.status(404).json({ error: `Could not resolve path for "${id}"` });
    }
    if (resolved.versionNotFound) {
      return res.status(404).json({ error: `Version "${resolved.requested}" not found`, available: resolved.available });
    }
    if (resolved.needsLanguage) {
      return res.status(400).json({ error: 'Multiple languages available — specify lang parameter', available: resolved.available });
    }

    const entryFile = resolveEntryFile(resolved, type);
    if (entryFile.error) {
      return res.status(500).json({ error: entryFile.error });
    }

    let content;
    if (file) {
      if (!resolved.files.includes(file)) {
        const entryFileName = type === 'skill' ? 'SKILL.md' : 'DOC.md';
        const available = resolved.files.filter(f => f !== entryFileName);
        return res.status(404).json({ error: `File "${file}" not found`, available });
      }
      content = await fetchDoc(resolved.source, join(resolved.path, file));
    } else if (full === 'true' && resolved.files.length > 0) {
      const allFiles = await fetchDocFull(resolved.source, resolved.path, resolved.files);
      content = allFiles.map(f => `# FILE: ${f.name}\n\n${f.content}`).join('\n\n---\n\n');
    } else {
      content = await fetchDoc(resolved.source, entryFile.filePath);
    }

    res.type('text/markdown').send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function handleGetRegistry(req, res) {
  try {
    const entries = listEntries({});
    const simplified = entries.map(simplifyEntry);
    res.json({ entries: simplified, total: simplified.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function handleGetFileByPath(req, res) {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path query parameter' });
    }
    if (filePath.includes('..')) {
      return res.status(400).json({ error: 'Path traversal not allowed' });
    }

    const config = loadConfig();
    const { existsSync, readFileSync } = await import('node:fs');

    for (const source of config.sources) {
      if (source.path) {
        const full = join(source.path, filePath);
        if (existsSync(full)) {
          return res.type('text/markdown').send(readFileSync(full, 'utf8'));
        }
      }
    }

    const distPath = repoPath('cli', 'dist', filePath);
    if (existsSync(distPath)) {
      return res.type('text/markdown').send(readFileSync(distPath, 'utf8'));
    }

    res.status(404).json({ error: `File not found: ${filePath}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function handleGetTree(req, res) {
  try {
    const config = loadConfig();
    const trees = {};

    for (const source of config.sources) {
      if (source.path) {
        trees[source.name] = buildContentTree(source.path);
      }
    }

    // Also build tree from bundled dist if local sources are empty
    if (Object.keys(trees).length === 0) {
      const distDir = repoPath('cli', 'dist');
      trees['bundled'] = buildContentTree(distDir);
    }

    res.json(trees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function handleGetStats(req, res) {
  try {
    const stats = getCacheStats();
    const entries = listEntries({});
    const docs = entries.filter(e => e._type === 'doc' || e.languages);
    const skills = entries.filter(e => e._type === 'skill' || !e.languages);

    res.json({
      sources: stats.sources,
      counts: { total: entries.length, docs: docs.length, skills: skills.length },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

let buildInProgress = false;

export function handleBuild(req, res) {
  if (buildInProgress) {
    return res.status(409).json({ error: 'A build is already in progress' });
  }

  const contentDir = req.body?.contentDir || repoPath('content');
  const outputDir = req.body?.outputDir || repoPath('cli', 'dist');
  const chubBin = repoPath('cli', 'bin', 'chub');

  buildInProgress = true;
  const chunks = [];

  const child = spawn('node', [chubBin, 'build', contentDir, '-o', outputDir], {
    cwd: REPO_ROOT,
    env: { ...process.env },
  });

  child.stdout.on('data', d => chunks.push(d.toString()));
  child.stderr.on('data', d => chunks.push(d.toString()));

  child.on('close', (code) => {
    buildInProgress = false;
    const output = chunks.join('');
    if (code === 0) {
      try {
        syncDistToCache(outputDir);
      } catch (syncErr) {
        console.warn('[build] Cache sync warning:', syncErr.message);
      }

      // Hot-reload: clear the in-memory registry cache and re-read from disk
      resetRegistry();
      ensureRegistry().catch(err => {
        console.warn('[build] Registry reload warning:', err.message);
      });
      console.log('[server] Registry hot-reloaded after build.');

      res.json({
        status: 'success',
        output,
        note: 'Registry rebuilt and reloaded.',
      });
    } else {
      res.status(500).json({ status: 'failed', exitCode: code, output });
    }
  });

  child.on('error', (err) => {
    buildInProgress = false;
    res.status(500).json({ error: `Build process failed: ${err.message}` });
  });
}

/**
 * Copy registry.json and search-index.json from the build output directory
 * into ~/.chub/sources/default/ so that the upstream runtime loader picks
 * them up on the next process start.
 */
function syncDistToCache(distDir) {
  const chubDir = getChubDir();
  const cacheDir = join(chubDir, 'sources', 'default');
  mkdirSync(cacheDir, { recursive: true });

  for (const file of ['registry.json', 'search-index.json']) {
    const src = join(distDir, file);
    if (existsSync(src)) {
      copyFileSync(src, join(cacheDir, file));
      console.log(`[build] Synced ${file} → ${cacheDir}`);
    }
  }
}
