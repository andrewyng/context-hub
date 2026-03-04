/**
 * BM25 search implementation for Context Hub.
 * Index is built at `chub build` time, scoring happens at search time.
 * Tokenizer is shared between build and search to ensure consistency.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'have', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
  'the', 'to', 'was', 'were', 'will', 'with', 'this', 'but', 'not',
  'you', 'your', 'can', 'do', 'does', 'how', 'if', 'may', 'no',
  'so', 'than', 'too', 'very', 'just', 'about', 'into', 'over',
  'such', 'then', 'them', 'these', 'those', 'through', 'under',
  'use', 'using', 'used',
]);

// BM25 default parameters
const DEFAULT_K1 = 1.5;
const DEFAULT_B = 0.75;

// Field weights for multi-field scoring
const FIELD_WEIGHTS = {
  name: 3.0,
  tags: 2.0,
  description: 1.0,
};

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
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
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
  const dfMap = {}; // document frequency per term (across all fields)
  const fieldLengths = { name: [], description: [], tags: [] };

  for (const entry of entries) {
    const nameTokens = tokenize(entry.name);
    const descTokens = tokenize(entry.description || '');
    const tagTokens = (entry.tags || []).flatMap((t) => tokenize(t));

    documents.push({
      id: entry.id,
      tokens: {
        name: nameTokens,
        description: descTokens,
        tags: tagTokens,
      },
    });

    fieldLengths.name.push(nameTokens.length);
    fieldLengths.description.push(descTokens.length);
    fieldLengths.tags.push(tagTokens.length);

    // Count document frequency — a term counts once per document (union of all fields)
    const allTerms = new Set([...nameTokens, ...descTokens, ...tagTokens]);
    for (const term of allTerms) {
      dfMap[term] = (dfMap[term] || 0) + 1;
    }
  }

  const N = documents.length;

  // Compute IDF for each term
  const idf = {};
  for (const [term, df] of Object.entries(dfMap)) {
    idf[term] = Math.log((N - df + 0.5) / (df + 0.5) + 1);
  }

  // Compute average field lengths
  const avg = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
  const avgFieldLengths = {
    name: avg(fieldLengths.name),
    description: avg(fieldLengths.description),
    tags: avg(fieldLengths.tags),
  };

  return {
    version: '1.0.0',
    algorithm: 'bm25',
    params: { k1: DEFAULT_K1, b: DEFAULT_B },
    totalDocs: N,
    avgFieldLengths,
    idf,
    documents,
  };
}

/**
 * Compute BM25 score for a single field.
 */
function scoreField(queryTerms, fieldTokens, idf, avgFieldLen, k1, b) {
  if (fieldTokens.length === 0) return 0;

  // Build term frequency map for this field
  const tf = {};
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

/**
 * Search the BM25 index with a query string.
 *
 * @param {string} query - The search query
 * @param {Object} index - The pre-built BM25 index
 * @param {Object} opts - Options: { limit }
 * @returns {Array} Sorted results: [{ id, score }]
 */
export function search(query, index, opts = {}) {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const { k1, b } = index.params;
  const results = [];

  for (const doc of index.documents) {
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

  if (opts.limit) {
    return results.slice(0, opts.limit);
  }

  return results;
}
