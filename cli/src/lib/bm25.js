/**
 * BM25 search implementation for Context Hub.
 * Index is built at `chub build` time, scoring happens at search time.
 * Tokenizer is shared between build and search to ensure consistency.
 */

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
  'this',
  'but',
  'not',
  'you',
  'your',
  'can',
  'do',
  'does',
  'how',
  'if',
  'may',
  'no',
  'so',
  'than',
  'too',
  'very',
  'just',
  'about',
  'into',
  'over',
  'such',
  'then',
  'them',
  'these',
  'those',
  'through',
  'under',
  'use',
  'using',
  'used',
]);

const GENERIC_PATH_SEGMENTS = new Set([
  'doc',
  'docs',
  'skill',
  'skills',
  'readme',
  'reference',
  'references',
  'guide',
  'guides',
  'example',
  'examples',
  'snippet',
  'snippets',
  'index',
  'overview',
  'api',
]);

const MAIN_ENTRY_FILES = new Set(['doc.md', 'skill.md']);

// BM25 default parameters
const DEFAULT_K1 = 1.5;
const DEFAULT_B = 0.75;

// Field weights for multi-field scoring.
// Expansion is intentionally lower than explicit metadata so exact id/name matches still dominate,
// while reference-file topics remain searchable in the first pass.
const FIELD_WEIGHTS = {
  id: 4.0,
  name: 3.0,
  tags: 2.0,
  description: 1.0,
  expansion: 0.9,
};

function getDefaultParams() {
  return { k1: DEFAULT_K1, b: DEFAULT_B };
}

function isSearchableToken(token) {
  return (token.length > 1 || /^\d+$/.test(token)) && !STOP_WORDS.has(token);
}

export function compactIdentifier(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function splitAlphaNumeric(text) {
  return text
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2');
}

/**
 * Tokenize text into lowercase terms with stop word removal.
 * Must be used identically at build time and search time.
 */
export function tokenize(text) {
  if (!text) return [];

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(isSearchableToken);
}

/**
 * Tokenize identifiers more aggressively than free text so package ids
 * still match joined/split variants like "nodefetch" and "auth 0".
 */
export function tokenizeIdentifier(text) {
  if (!text) return [];

  const tokens = new Set(tokenize(text));
  const raw = String(text);
  const compact = compactIdentifier(raw);
  const segments = new Set([
    ...raw.split('/').map((segment) => compactIdentifier(segment)),
    ...raw.split(/[\/_.\s-]+/).map((segment) => compactIdentifier(segment)),
  ]);

  if (isSearchableToken(compact)) {
    tokens.add(compact);
  }

  for (const token of tokenize(splitAlphaNumeric(compact))) {
    tokens.add(token);
  }

  for (const segment of segments) {
    if (!segment) continue;

    if (isSearchableToken(segment)) {
      tokens.add(segment);
    }

    for (const token of tokenize(splitAlphaNumeric(segment))) {
      tokens.add(token);
    }
  }

  return [...tokens];
}

function stripFileExtension(fileName) {
  return String(fileName || '').replace(/\.[a-z0-9]+$/i, '');
}

function addWeightedTokens(target, tokens, weight = 1, maxPerToken = 3) {
  const counts = Object.create(null);
  for (const existing of target) {
    counts[existing] = (counts[existing] || 0) + 1;
  }

  for (let idx = 0; idx < weight; idx++) {
    for (const token of tokens) {
      if (!token) continue;
      if ((counts[token] || 0) >= maxPerToken) continue;
      target.push(token);
      counts[token] = (counts[token] || 0) + 1;
    }
  }
}

function collectEntryFiles(entry) {
  const files = new Set();

  for (const file of entry.files || []) {
    if (file) files.add(String(file));
  }

  for (const language of entry.languages || []) {
    for (const version of language.versions || []) {
      for (const file of version.files || []) {
        if (file) files.add(String(file));
      }
    }
  }

  return [...files];
}

function extractExpansionTokensFromFile(filePath) {
  const normalizedPath = String(filePath || '').replace(/\\/g, '/').toLowerCase();
  if (!normalizedPath || MAIN_ENTRY_FILES.has(normalizedPath)) {
    return [];
  }

  const segments = normalizedPath
    .split('/')
    .map((segment) => stripFileExtension(segment))
    .filter(Boolean);

  if (segments.length === 0) {
    return [];
  }

  const isReferenceLike = segments.some((segment) => segment === 'reference' || segment === 'references');
  const isGuideLike = segments.some((segment) => segment === 'guide' || segment === 'guides');
  const isExampleLike = segments.some((segment) => segment === 'example' || segment === 'examples');

  const expansionTokens = [];

  for (let idx = 0; idx < segments.length; idx++) {
    const segment = segments[idx];
    const compact = compactIdentifier(segment);
    if (!compact || GENERIC_PATH_SEGMENTS.has(compact)) {
      continue;
    }

    const tokens = tokenizeIdentifier(segment);
    if (tokens.length === 0) {
      continue;
    }

    const isBasename = idx === segments.length - 1;
    let weight = isBasename ? 2 : 1;

    if (isBasename && isReferenceLike) weight = 3;
    else if (isBasename && (isGuideLike || isExampleLike)) weight = 2;

    addWeightedTokens(expansionTokens, tokens, weight);
  }

  return expansionTokens;
}

function collectExpansionTokens(entry) {
  const files = collectEntryFiles(entry);
  const tokens = [];

  for (const filePath of files) {
    addWeightedTokens(tokens, extractExpansionTokensFromFile(filePath), 1);
    if (tokens.length >= 192) {
      return tokens.slice(0, 192);
    }
  }

  return tokens;
}

function buildInvertedIndex(documents) {
  const invertedIndex = Object.create(null);

  for (const [docIndex, doc] of documents.entries()) {
    const allTerms = new Set([
      ...(doc.tokens.id || []),
      ...(doc.tokens.name || []),
      ...(doc.tokens.description || []),
      ...(doc.tokens.tags || []),
      ...(doc.tokens.expansion || []),
    ]);

    for (const term of allTerms) {
      if (!invertedIndex[term]) invertedIndex[term] = [];
      invertedIndex[term].push(docIndex);
    }
  }

  return invertedIndex;
}

export function buildIndexFromDocuments(documents, params = getDefaultParams()) {
  const dfMap = Object.create(null); // document frequency per term (across all fields)
  const fieldLengths = { id: [], name: [], description: [], tags: [], expansion: [] };

  for (const doc of documents) {
    const idTokens = doc.tokens.id || [];
    const nameTokens = doc.tokens.name || [];
    const descTokens = doc.tokens.description || [];
    const tagTokens = doc.tokens.tags || [];
    const expansionTokens = doc.tokens.expansion || [];

    fieldLengths.id.push(idTokens.length);
    fieldLengths.name.push(nameTokens.length);
    fieldLengths.description.push(descTokens.length);
    fieldLengths.tags.push(tagTokens.length);
    fieldLengths.expansion.push(expansionTokens.length);

    const allTerms = new Set([
      ...idTokens,
      ...nameTokens,
      ...descTokens,
      ...tagTokens,
      ...expansionTokens,
    ]);

    for (const term of allTerms) {
      dfMap[term] = (dfMap[term] || 0) + 1;
    }
  }

  const N = documents.length;
  const idf = Object.create(null);

  for (const [term, df] of Object.entries(dfMap)) {
    idf[term] = Math.log((N - df + 0.5) / (df + 0.5) + 1);
  }

  const avg = (arr) => (arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length);

  return {
    version: '1.0.0',
    algorithm: 'bm25',
    params,
    totalDocs: N,
    avgFieldLengths: {
      id: avg(fieldLengths.id),
      name: avg(fieldLengths.name),
      description: avg(fieldLengths.description),
      tags: avg(fieldLengths.tags),
      expansion: avg(fieldLengths.expansion),
    },
    idf,
    documents,
    invertedIndex: buildInvertedIndex(documents),
  };
}

/**
 * Build a BM25 search index from registry entries.
 * Called during `chub build`.
 *
 * @param {Array} entries - Combined docs and skills from registry
 * @returns {Object} The search index
 */
export function buildIndex(entries) {
  const documents = [];

  for (const entry of entries) {
    const idTokens = tokenizeIdentifier(entry.id);
    const nameTokens = tokenize(entry.name);
    const descTokens = tokenize(entry.description || '');
    const tagTokens = (entry.tags || []).flatMap((t) => tokenize(t));
    const expansionTokens = collectExpansionTokens(entry);

    documents.push({
      id: entry.id,
      tokens: {
        id: idTokens,
        name: nameTokens,
        description: descTokens,
        tags: tagTokens,
        expansion: expansionTokens,
      },
    });
  }

  return buildIndexFromDocuments(documents);
}

/**
 * Compute BM25 score for a single field.
 */
function scoreField(queryTerms, fieldTokens, idf, avgFieldLen, k1, b) {
  if (fieldTokens.length === 0) return 0;

  // Build term frequency map for this field
  const tf = Object.create(null);
  for (const t of fieldTokens) {
    tf[t] = (tf[t] || 0) + 1;
  }

  let score = 0;
  const dl = fieldTokens.length;

  for (const term of queryTerms) {
    const termFreq = tf[term] || 0;
    if (termFreq === 0) continue;

    const termIdf = idf[term] || 0;
    const numerator = termFreq * (k1 + 1);
    const denominator = termFreq + k1 * (1 - b + b * (dl / (avgFieldLen || 1)));
    score += termIdf * (numerator / denominator);
  }

  return score;
}

function getCandidateDocIndexes(queryTerms, index) {
  if (!index.invertedIndex) {
    return index.documents.map((_, docIndex) => docIndex);
  }

  const candidateIndexes = new Set();
  for (const term of new Set(queryTerms)) {
    const postings = index.invertedIndex[term];
    if (!postings) continue;
    for (const docIndex of postings) {
      candidateIndexes.add(docIndex);
    }
  }

  return [...candidateIndexes];
}

function runSearch(query, index, opts = {}) {
  const queryTerms = tokenize(query);
  const totalDocs = index.documents.length;

  if (queryTerms.length === 0) {
    return {
      results: [],
      stats: {
        totalDocs,
        candidateDocCount: 0,
        scoredDocCount: 0,
        matchedDocCount: 0,
        usedInvertedIndex: !!index.invertedIndex,
      },
    };
  }

  const { k1, b } = index.params;
  const results = [];
  const candidateDocIndexes = getCandidateDocIndexes(queryTerms, index);

  for (const docIndex of candidateDocIndexes) {
    const doc = index.documents[docIndex];
    let totalScore = 0;

    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      const fieldTokens = doc.tokens[field] || [];
      const avgLen = index.avgFieldLengths[field] || 1;
      const fieldScore = scoreField(queryTerms, fieldTokens, index.idf, avgLen, k1, b);
      totalScore += fieldScore * weight;
    }

    if (totalScore > 0) {
      results.push({ id: doc.id, score: totalScore });
    }
  }

  results.sort((a, b) => b.score - a.score);
  const limitedResults = opts.limit ? results.slice(0, opts.limit) : results;

  return {
    results: limitedResults,
    stats: {
      totalDocs,
      candidateDocCount: candidateDocIndexes.length,
      scoredDocCount: candidateDocIndexes.length,
      matchedDocCount: results.length,
      usedInvertedIndex: !!index.invertedIndex,
    },
  };
}

/**
 * Search the BM25 index with a query string.
 *
 * @param {string} query - The search query
 * @param {Object} index - The pre-built BM25 index
 * @param {Object} opts - Options: { limit }
 * @returns {Array} Sorted results: [{ id, score }]
 */
export function search(query, index, opts = {}) {
  return runSearch(query, index, opts).results;
}

export function searchWithStats(query, index, opts = {}) {
  return runSearch(query, index, opts);
}
