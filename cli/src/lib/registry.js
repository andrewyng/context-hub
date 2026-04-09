import { loadSourceRegistry, loadSearchIndex } from './cache.js';
import { loadConfig } from './config.js';
import { normalizeLanguage } from './normalize.js';
import { buildIndexFromDocuments, compactIdentifier, search as bm25Search, tokenize } from './bm25.js';
import { scoreEntryCoverageBoost, scoreKeywordFallback } from './relevance.js';

let _merged = null;
let _searchIndex = null;

function getSearchLookupId(sourceName, entryId) {
  return `${sourceName}:${entryId}`;
}

function normalizeQuery(query) {
  return String(query || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function splitCompactSegments(text) {
  return [...new Set([
    ...String(text || '').split('/').map((segment) => compactIdentifier(segment)),
    ...String(text || '').split(/[\/_.\s-]+/).map((segment) => compactIdentifier(segment)),
  ])].filter(Boolean);
}

function levenshteinDistance(a, b, maxDistance = Infinity) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, idx) => idx);
  let current = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    let rowMin = current[0];

    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitutionCost,
      );
      rowMin = Math.min(rowMin, current[j]);
    }

    if (rowMin > maxDistance) return maxDistance + 1;
    [previous, current] = [current, previous];
  }

  return previous[b.length];
}

function scoreCompactCandidate(queryCompact, candidateCompact, weights) {
  if (!queryCompact || !candidateCompact) return 0;
  if (candidateCompact === queryCompact) return weights.exact;
  if (queryCompact.length < 3) return 0;

  const lengthPenalty = Math.abs(candidateCompact.length - queryCompact.length);
  const lengthRatio = Math.min(candidateCompact.length, queryCompact.length)
    / Math.max(candidateCompact.length, queryCompact.length);

  if ((candidateCompact.startsWith(queryCompact) || queryCompact.startsWith(candidateCompact)) && lengthRatio >= 0.6) {
    return Math.max(weights.prefix - lengthPenalty, 0);
  }

  if ((candidateCompact.includes(queryCompact) || queryCompact.includes(candidateCompact)) && lengthRatio >= 0.75) {
    return Math.max(weights.contains - lengthPenalty, 0);
  }

  if (queryCompact.length < 5) return 0;

  const maxDistance = queryCompact.length <= 5 ? 1 : queryCompact.length <= 8 ? 2 : 3;
  const distance = levenshteinDistance(queryCompact, candidateCompact, maxDistance);
  if (distance > maxDistance) return 0;

  return Math.max(weights.fuzzy - (distance * 20) - lengthPenalty, 0);
}

function scoreEntryLexicalVariant(entry, queryCompact) {
  if (queryCompact.length < 2) return 0;

  const nameCompact = compactIdentifier(entry.name);
  const idCompact = compactIdentifier(entry.id);
  const idSegments = splitCompactSegments(entry.id);
  const nameSegments = splitCompactSegments(entry.name);

  let best = 0;

  best = Math.max(best, scoreCompactCandidate(queryCompact, nameCompact, {
    exact: 620,
    prefix: 560,
    contains: 520,
    fuzzy: 500,
  }));

  best = Math.max(best, scoreCompactCandidate(queryCompact, idCompact, {
    exact: 600,
    prefix: 540,
    contains: 500,
    fuzzy: 470,
  }));

  for (let idx = 0; idx < idSegments.length; idx++) {
    const segment = idSegments[idx];
    const segmentScore = scoreCompactCandidate(queryCompact, segment, {
      exact: 580,
      prefix: 530,
      contains: 490,
      fuzzy: 460,
    });
    if (segmentScore === 0) continue;

    let bonus = 0;
    const isFirst = idx === 0;
    const isLast = idx === idSegments.length - 1;
    if (isFirst) bonus += 10;
    if (isLast) bonus += 10;
    if (queryCompact === idSegments[0]) bonus += 60;
    if (queryCompact === idSegments[idSegments.length - 1]) bonus += 25;
    if (idSegments.length > 1 && queryCompact === idSegments[0] && queryCompact === idSegments[idSegments.length - 1]) {
      bonus += 40;
    }

    best = Math.max(best, segmentScore + bonus);
  }

  for (const segment of nameSegments) {
    best = Math.max(best, scoreCompactCandidate(queryCompact, segment, {
      exact: 560,
      prefix: 520,
      contains: 480,
      fuzzy: 450,
    }));
  }

  return best;
}

function scoreEntryLexicalBoost(entry, normalizedQuery, rescueTerms = []) {
  const queryCompacts = [...new Set([
    compactIdentifier(normalizedQuery),
    ...rescueTerms.map((term) => compactIdentifier(term)),
  ])].filter((queryCompact) => queryCompact.length >= 2);

  let best = 0;
  for (const queryCompact of queryCompacts) {
    best = Math.max(best, scoreEntryLexicalVariant(entry, queryCompact));
  }
  return best;
}

function getMissingQueryTerms(normalizedQuery) {
  if (!_searchIndex?.invertedIndex) {
    return [];
  }

  return tokenize(normalizedQuery).filter((term) => !_searchIndex.invertedIndex[term]?.length);
}

function shouldRunGlobalLexicalScan(normalizedQuery, resultByKey) {
  if (!_searchIndex || resultByKey.size === 0) {
    return true;
  }

  if (!_searchIndex.invertedIndex) {
    return false;
  }

  const queryTerms = tokenize(normalizedQuery);
  if (queryTerms.length < 2) {
    return false;
  }

  return getMissingQueryTerms(normalizedQuery).length > 0;
}

function namespaceSearchIndex(index, sourceName) {
  return {
    ...index,
    documents: (index.documents || []).map((doc) => ({
      ...doc,
      id: getSearchLookupId(sourceName, doc.id),
    })),
  };
}

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
    if (idx) searchIndexes.push(namespaceSearchIndex(idx, source.name));

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
      const [singleIndex] = searchIndexes;
      _searchIndex = singleIndex.invertedIndex
        ? singleIndex
        : buildIndexFromDocuments(singleIndex.documents, singleIndex.params);
    } else {
      const allDocuments = searchIndexes.flatMap((idx) => idx.documents);
      _searchIndex = buildIndexFromDocuments(allDocuments, searchIndexes[0].params);
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
  const normalizedQuery = normalizeQuery(query);
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
    entryById.set(getSearchLookupId(entry._source, entry.id), entry);
  }

  if (!normalizedQuery) {
    return applyFilters(deduped, filters).map((entry) => ({ ...entry, _score: 0 }));
  }

  const resultByKey = new Map();

  if (_searchIndex) {
    // BM25 search
    for (const match of bm25Search(normalizedQuery, _searchIndex)) {
      const entry = entryById.get(match.id);
      if (!entry) continue;
      const key = getSearchLookupId(entry._source, entry.id);
      resultByKey.set(key, {
        entry,
        score: match.score,
        baseKind: 'bm25',
        baseScore: match.score,
        lexicalBoost: 0,
        coverageBoost: 0,
      });
    }
  } else {
    // Fallback: keyword matching
    for (const entry of deduped) {
      const score = scoreKeywordFallback(entry, normalizedQuery);
      if (score > 0) {
        const key = getSearchLookupId(entry._source, entry.id);
        resultByKey.set(key, {
          entry,
          score,
          baseKind: 'keyword',
          baseScore: score,
          lexicalBoost: 0,
          coverageBoost: 0,
        });
      }
    }
  }

  const lexicalCandidates = !shouldRunGlobalLexicalScan(normalizedQuery, resultByKey)
    ? [...new Set([...resultByKey.values()].map(({ entry }) => entry))]
    : deduped;
  const rescueTerms = resultByKey.size > 0
    ? getMissingQueryTerms(normalizedQuery).filter((term) => term.length >= 5)
    : [];

  for (const entry of lexicalCandidates) {
    const boost = scoreEntryLexicalBoost(entry, normalizedQuery, rescueTerms);
    if (boost === 0) continue;

    const key = getSearchLookupId(entry._source, entry.id);
    const current = resultByKey.get(key);
    if (current) {
      current.score += boost;
      current.lexicalBoost += boost;
    } else {
      resultByKey.set(key, {
        entry,
        score: boost,
        baseKind: 'none',
        baseScore: 0,
        lexicalBoost: boost,
        coverageBoost: 0,
      });
    }
  }

  const queryTerms = tokenize(normalizedQuery).filter((term) => term.length >= 2);
  if (queryTerms.length > 1) {
    for (const entry of deduped) {
      const { score: coverageBoost, debug } = scoreEntryCoverageBoost(entry, normalizedQuery);
      if (coverageBoost === 0) continue;

      const key = getSearchLookupId(entry._source, entry.id);
      const current = resultByKey.get(key);
      if (current) {
        current.score += coverageBoost;
        current.coverageBoost += coverageBoost;
        if (filters.explain) current.coverageDebug = debug;
      } else {
        resultByKey.set(key, {
          entry,
          score: coverageBoost,
          baseKind: 'none',
          baseScore: 0,
          lexicalBoost: 0,
          coverageBoost,
          coverageDebug: filters.explain ? debug : undefined,
        });
      }
    }
  }

  let results = [...resultByKey.values()];

  const filtered = applyFilters(results.map((r) => r.entry), filters);
  const filteredSet = new Set(filtered);
  results = results.filter((r) => filteredSet.has(r.entry));

  results.sort((a, b) => b.score - a.score);
  return results.map((r) => ({
    ...r.entry,
    _score: r.score,
    ...(filters.explain ? {
      _debug: {
        baseKind: r.baseKind || 'none',
        baseScore: r.baseScore || 0,
        lexicalBoost: r.lexicalBoost || 0,
        coverageBoost: r.coverageBoost || 0,
        coverage: r.coverageDebug || null,
      },
    } : {}),
  }));
}

/**
 * Get entry by id or source/id, from a specific type array.
 * type: "doc" or "skill". If null, searches both.
 */
export function getEntry(idOrNamespacedId, type = null) {
  const normalizedId = normalizeQuery(idOrNamespacedId);
  const { docs, skills } = getMerged();
  let pool;
  if (type === 'doc') pool = applySourceFilter(docs);
  else if (type === 'skill') pool = applySourceFilter(skills);
  else pool = applySourceFilter([...docs, ...skills]);

  // Check for source:id format (colon separates source from id)
  if (normalizedId.includes(':')) {
    const colonIdx = normalizedId.indexOf(':');
    const sourceName = normalizedId.slice(0, colonIdx);
    const id = normalizedId.slice(colonIdx + 1);
    const entry = pool.find((e) => e._source === sourceName && e.id === id);
    return entry ? { entry, ambiguous: false } : { entry: null, ambiguous: false };
  }

  // Bare id (may contain slashes like author/name)
  const matches = pool.filter((e) => e.id === normalizedId);
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
  } else {
    return {
      needsLanguage: true,
      available: entry.languages.map((l) => l.language),
    };
  }

  if (!langObj) return null;

  let verObj = null;
  if (version) {
    verObj = langObj.versions?.find((v) => v.version === version);
    if (!verObj) {
      return {
        versionNotFound: true,
        requested: version,
        available: langObj.versions?.map((v) => v.version) || [],
      };
    }
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
  if (!resolved || resolved.needsLanguage || resolved.versionNotFound) return { error: 'unresolved' };

  const fileName = type === 'skill' ? 'SKILL.md' : 'DOC.md';

  return {
    filePath: `${resolved.path}/${fileName}`,
    basePath: resolved.path,
    files: resolved.files,
  };
}
