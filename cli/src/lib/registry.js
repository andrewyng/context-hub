import { loadSourceRegistry, loadSearchIndex } from './cache.js';
import { loadConfig } from './config.js';
import { normalizeLanguage } from './normalize.js';
import { search as bm25Search } from './bm25.js';

let _merged = null;
let _searchIndex = null;

/**
 * Load and merge entries from all configured sources.
 * Returns { docs: [...], skills: [...] } with each entry tagged with _source/_sourceObj.
 */
function getMerged() {
  if (_merged) return _merged;

  const config = loadConfig();
  const allDocs = [];
  const allSkills = [];
  const searchIndexes = [];

  for (const source of config.sources) {
    const registry = loadSourceRegistry(source);
    if (!registry) continue;

    // Load BM25 search index if available
    const idx = loadSearchIndex(source);
    if (idx) searchIndexes.push(idx);

    // Support both new format (docs/skills) and old format (entries)
    if (registry.docs) {
      for (const doc of registry.docs) {
        allDocs.push({ ...doc, id: doc.id || doc.name, _source: source.name, _sourceObj: source });
      }
    }
    if (registry.skills) {
      for (const skill of registry.skills) {
        allSkills.push({ ...skill, id: skill.id || skill.name, _source: source.name, _sourceObj: source });
      }
    }

    // Backward compat: old entries[] format
    if (registry.entries) {
      for (const entry of registry.entries) {
        const tagged = { ...entry, _source: source.name, _sourceObj: source };
        const provides = entry.languages?.[0]?.versions?.[0]?.provides || [];
        if (provides.includes('skill')) {
          allSkills.push(tagged);
        }
        if (provides.includes('doc') || provides.length === 0) {
          allDocs.push(tagged);
        }
      }
    }
  }

  // Merge search indexes (combine documents and recompute IDF)
  if (searchIndexes.length > 0) {
    if (searchIndexes.length === 1) {
      _searchIndex = searchIndexes[0];
    } else {
      // Merge multiple indexes: combine documents, recompute global IDF
      const allDocuments = searchIndexes.flatMap((idx) => idx.documents);
      const N = allDocuments.length;
      const dfMap = {};
      const fieldLengths = { name: [], description: [], tags: [] };

      for (const doc of allDocuments) {
        const allTerms = new Set([
          ...(doc.tokens.name || []),
          ...(doc.tokens.description || []),
          ...(doc.tokens.tags || []),
        ]);
        for (const term of allTerms) {
          dfMap[term] = (dfMap[term] || 0) + 1;
        }
        fieldLengths.name.push((doc.tokens.name || []).length);
        fieldLengths.description.push((doc.tokens.description || []).length);
        fieldLengths.tags.push((doc.tokens.tags || []).length);
      }

      const idf = {};
      for (const [term, df] of Object.entries(dfMap)) {
        idf[term] = Math.log((N - df + 0.5) / (df + 0.5) + 1);
      }

      const avg = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
      _searchIndex = {
        version: '1.0.0',
        algorithm: 'bm25',
        params: searchIndexes[0].params,
        totalDocs: N,
        avgFieldLengths: {
          name: avg(fieldLengths.name),
          description: avg(fieldLengths.description),
          tags: avg(fieldLengths.tags),
        },
        idf,
        documents: allDocuments,
      };
    }
  }

  _merged = { docs: allDocs, skills: allSkills };
  return _merged;
}

/**
 * Get all entries (docs + skills combined) for listing/searching.
 */
function getAllEntries() {
  const { docs, skills } = getMerged();
  // Tag each with _type for display
  const taggedDocs = docs.map((d) => ({ ...d, _type: 'doc' }));
  const taggedSkills = skills.map((s) => ({ ...s, _type: 'skill' }));
  // Deduplicate: if same id+source appears in both, keep both but mark as bundled
  return [...taggedDocs, ...taggedSkills];
}

/**
 * Filter entries by the global source trust policy.
 */
function applySourceFilter(entries) {
  const config = loadConfig();
  const allowed = config.source.split(',').map((s) => s.trim().toLowerCase());
  return entries.filter((e) => !e.source || allowed.includes(e.source.toLowerCase()));
}

/**
 * Apply tag and language filters.
 */
function applyFilters(entries, filters) {
  let result = entries;

  if (filters.tags) {
    const filterTags = filters.tags.split(',').map((t) => t.trim().toLowerCase());
    result = result.filter((e) =>
      filterTags.every((ft) => e.tags?.some((t) => t.toLowerCase() === ft))
    );
  }
  if (filters.lang) {
    const lang = normalizeLanguage(filters.lang);
    result = result.filter((e) =>
      e.languages?.some((l) => l.language === lang)
    );
  }

  return result;
}

/**
 * Check if an id has collisions across sources.
 */
function getEntriesById(id, entries) {
  return entries.filter((e) => e.id === id);
}

/**
 * Check if we're in multi-source mode.
 */
export function isMultiSource() {
  const config = loadConfig();
  return config.sources.length > 1;
}

/**
 * Get the display id for an entry — namespaced only on collision.
 */
export function getDisplayId(entry) {
  if (!isMultiSource()) return entry.id;
  const all = applySourceFilter(getAllEntries());
  const matches = getEntriesById(entry.id, all).filter((e) => e._type === entry._type);
  if (matches.length > 1) return `${entry._source}:${entry.id}`;
  return entry.id;
}

/**
 * Search entries by query string. Searches both docs and skills.
 * Uses BM25 when a search index is available, falls back to keyword matching.
 */
export function searchEntries(query, filters = {}) {
  const entries = applySourceFilter(getAllEntries());

  // Deduplicate: same id+source appearing as both doc and skill → show once
  const seen = new Set();
  const deduped = [];
  for (const entry of entries) {
    const key = `${entry._source}:${entry.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(entry);
    }
  }

  // Build entry lookup by id
  const entryById = new Map();
  for (const entry of deduped) {
    entryById.set(entry.id, entry);
  }

  let results;

  if (_searchIndex) {
    // BM25 search
    const bm25Results = bm25Search(query, _searchIndex);
    results = bm25Results
      .map((r) => {
        const entry = entryById.get(r.id);
        return entry ? { entry, score: r.score } : null;
      })
      .filter(Boolean);
  } else {
    // Fallback: keyword matching
    const q = query.toLowerCase();
    const words = q.split(/\s+/);

    results = deduped.map((entry) => {
      let score = 0;

      if (entry.id === q) score += 100;
      else if (entry.id.includes(q)) score += 50;

      const nameLower = entry.name.toLowerCase();
      if (nameLower === q) score += 80;
      else if (nameLower.includes(q)) score += 40;

      for (const word of words) {
        if (entry.id.includes(word)) score += 10;
        if (nameLower.includes(word)) score += 10;
        if (entry.description?.toLowerCase().includes(word)) score += 5;
        if (entry.tags?.some((t) => t.toLowerCase().includes(word))) score += 15;
      }

      return { entry, score };
    });

    results = results.filter((r) => r.score > 0);
  }

  const filtered = applyFilters(results.map((r) => r.entry), filters);
  const filteredSet = new Set(filtered);
  results = results.filter((r) => filteredSet.has(r.entry));

  results.sort((a, b) => b.score - a.score);
  return results.map((r) => ({ ...r.entry, _score: r.score }));
}

/**
 * Get entry by id or source/id, from a specific type array.
 * type: "doc" or "skill". If null, searches both.
 */
export function getEntry(idOrNamespacedId, type = null) {
  const { docs, skills } = getMerged();
  let pool;
  if (type === 'doc') pool = applySourceFilter(docs);
  else if (type === 'skill') pool = applySourceFilter(skills);
  else pool = applySourceFilter([...docs, ...skills]);

  // Check for source:id format (colon separates source from id)
  if (idOrNamespacedId.includes(':')) {
    const colonIdx = idOrNamespacedId.indexOf(':');
    const sourceName = idOrNamespacedId.slice(0, colonIdx);
    const id = idOrNamespacedId.slice(colonIdx + 1);
    const entry = pool.find((e) => e._source === sourceName && e.id === id);
    return entry ? { entry, ambiguous: false } : { entry: null, ambiguous: false };
  }

  // Bare id (may contain slashes like author/name)
  const matches = pool.filter((e) => e.id === idOrNamespacedId);
  if (matches.length === 0) return { entry: null, ambiguous: false };
  if (matches.length === 1) return { entry: matches[0], ambiguous: false };

  // Ambiguous — multiple sources have this id
  return {
    entry: null,
    ambiguous: true,
    alternatives: matches.map((e) => `${e._source}:${e.id}`),
  };
}

/**
 * List entries with optional filters. Searches both docs and skills, deduped.
 */
export function listEntries(filters = {}) {
  const entries = applySourceFilter(getAllEntries());
  // Deduplicate
  const seen = new Set();
  const deduped = [];
  for (const entry of entries) {
    const key = `${entry._source}:${entry.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(entry);
    }
  }
  return applyFilters(deduped, filters);
}

/**
 * Resolve the doc path + source for a doc entry.
 * Returns { source, path, files } or null.
 * If language is null and multiple languages exist, returns { needsLanguage: true, available: [...] }.
 */
export function resolveDocPath(entry, language, version) {
  const lang = language ? normalizeLanguage(language) : null;

  // Skills are flat — no language/version nesting
  if (!entry.languages) {
    // This is a skill entry — path is directly on the entry
    if (!entry.path) return null;
    return {
      source: entry._sourceObj,
      path: entry.path,
      files: entry.files || [],
    };
  }

  let langObj = null;
  if (lang) {
    langObj = entry.languages.find((l) => l.language === lang);
  } else if (entry.languages.length === 1) {
    langObj = entry.languages[0];
  } else if (entry.languages.length > 1) {
    return {
      needsLanguage: true,
      available: entry.languages.map((l) => l.language),
    };
  }

  if (!langObj) return null;

  let verObj = null;
  if (version) {
    verObj = langObj.versions?.find((v) => v.version === version);
  } else {
    const rec = langObj.recommendedVersion;
    verObj = langObj.versions?.find((v) => v.version === rec) || langObj.versions?.[0];
  }

  if (!verObj?.path) return null;
  return {
    source: entry._sourceObj,
    path: verObj.path,
    files: verObj.files || [],
  };
}

/**
 * Given a resolved path and a type ("doc" or "skill"), return the entry file path.
 */
export function resolveEntryFile(resolved, type) {
  if (!resolved || resolved.needsLanguage) return { error: 'unresolved' };

  const fileName = type === 'skill' ? 'SKILL.md' : 'DOC.md';

  return {
    filePath: `${resolved.path}/${fileName}`,
    basePath: resolved.path,
    files: resolved.files,
  };
}
