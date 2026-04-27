import { compactIdentifier, tokenize } from './bm25.js';

function normalizeText(text) {
  return String(text || '').toLowerCase();
}

function splitCompactSegments(text) {
  return [...new Set([
    ...String(text || '').split('/').map((segment) => compactIdentifier(segment)),
    ...String(text || '').split(/[\/_.\s-]+/).map((segment) => compactIdentifier(segment)),
  ])].filter(Boolean);
}

function tokenizeQuery(query) {
  return [...new Set(tokenize(normalizeText(query)).filter((term) => term.length >= 2))];
}

function buildAcronym(text) {
  const words = normalizeText(text).match(/[a-z0-9]+/g) || [];
  if (words.length < 2) return '';
  return words.map((word) => word[0]).join('');
}

function includesInOrder(haystack, terms) {
  let cursor = 0;
  for (const term of terms) {
    const next = haystack.indexOf(term, cursor);
    if (next === -1) return false;
    cursor = next + term.length;
  }
  return true;
}

function emptyCoverageResult(totalTerms = 0) {
  return {
    score: 0,
    debug: {
      matchedTerms: [],
      matchedCount: 0,
      totalTerms,
      coverageRatio: 0,
      phraseField: null,
      orderedField: null,
      reasons: totalTerms > 0 ? [`coverage 0/${totalTerms}`] : [],
    },
  };
}

export function scoreKeywordFallback(entry, normalizedQuery) {
  const q = normalizeText(normalizedQuery).trim();
  if (!q) return 0;

  const words = q.split(/\s+/).filter(Boolean);
  const idLower = normalizeText(entry.id);
  const nameLower = normalizeText(entry.name);
  const descriptionLower = normalizeText(entry.description);
  let score = 0;

  if (idLower === q) score += 100;
  else if (idLower.includes(q)) score += 50;

  if (nameLower === q) score += 80;
  else if (nameLower.includes(q)) score += 40;

  for (const word of words) {
    if (idLower.includes(word)) score += 10;
    if (nameLower.includes(word)) score += 10;
    if (descriptionLower.includes(word)) score += 5;
    if (entry.tags?.some((tag) => normalizeText(tag).includes(word))) score += 15;
  }

  return score;
}

export function scoreEntryCoverageBoost(entry, normalizedQuery) {
  const normalized = normalizeText(normalizedQuery).trim();
  const terms = tokenizeQuery(normalized);
  if (terms.length === 0) return emptyCoverageResult(terms.length);

  const idLower = normalizeText(entry.id);
  const nameLower = normalizeText(entry.name);
  const descriptionLower = normalizeText(entry.description);
  const tagValues = (entry.tags || []).map((tag) => normalizeText(tag));
  const idSegments = splitCompactSegments(entry.id);
  const nameSegments = splitCompactSegments(entry.name);
  const acronym = buildAcronym(entry.name);

  let score = 0;
  const matchedTerms = [];
  let sawAcronymMatch = false;

  for (const term of terms) {
    const compactTerm = compactIdentifier(term);
    const fields = new Set();
    let termScore = 0;

    if (idSegments.includes(compactTerm)) {
      fields.add('id');
      termScore = Math.max(termScore, 26);
    } else if (idLower.includes(term)) {
      fields.add('id');
      termScore = Math.max(termScore, 18);
    }

    if (nameSegments.includes(compactTerm)) {
      fields.add('name');
      termScore = Math.max(termScore, 24);
    } else if (nameLower.includes(term)) {
      fields.add('name');
      termScore = Math.max(termScore, 16);
    }

    if (tagValues.some((tag) => tag === term || tag.includes(term))) {
      fields.add('tags');
      termScore = Math.max(termScore, 14);
    }

    if (descriptionLower.includes(term)) {
      fields.add('description');
      termScore = Math.max(termScore, 8);
    }

    if (acronym && acronym === compactTerm && compactTerm.length >= 2 && compactTerm.length <= 6) {
      fields.add('acronym');
      termScore = Math.max(termScore, 28);
      sawAcronymMatch = true;
    }

    if (termScore > 0) {
      score += termScore;
      matchedTerms.push(`${term}:${[...fields].join('+')}`);
    }
  }

  const matchedCount = matchedTerms.length;
  if (matchedCount === 0) return emptyCoverageResult(terms.length);

  const coverageRatio = matchedCount / terms.length;
  const phraseField = idLower.includes(normalized)
    ? 'id'
    : nameLower.includes(normalized)
      ? 'name'
      : descriptionLower.includes(normalized)
        ? 'description'
        : null;

  const orderedField = includesInOrder(idLower, terms)
    ? 'id'
    : includesInOrder(nameLower, terms)
      ? 'name'
      : includesInOrder(descriptionLower, terms)
        ? 'description'
        : null;

  if (coverageRatio > 0) {
    score += Math.round(coverageRatio * 40);
  }
  if (matchedCount === terms.length) {
    score += 35;
  }

  if (phraseField === 'id') score += 50;
  else if (phraseField === 'name') score += 44;
  else if (phraseField === 'description') score += 18;

  if (orderedField === 'id' && phraseField !== 'id') score += 24;
  else if (orderedField === 'name' && phraseField !== 'name') score += 20;
  else if (orderedField === 'description' && phraseField !== 'description') score += 10;

  const reasons = [`coverage ${matchedCount}/${terms.length}`];
  if (matchedCount === terms.length) reasons.push('full coverage');
  if (phraseField) reasons.push(`phrase:${phraseField}`);
  if (orderedField && orderedField !== phraseField) reasons.push(`ordered:${orderedField}`);
  if (sawAcronymMatch) reasons.push(`acronym:${acronym}`);

  const needsStrongSingleTermSignal = terms.length === 1;
  const lacksEnoughMultiTermCoverage = matchedCount < Math.min(2, terms.length)
    && !phraseField
    && !orderedField
    && !sawAcronymMatch;

  if ((needsStrongSingleTermSignal && !phraseField && !sawAcronymMatch) || (!needsStrongSingleTermSignal && lacksEnoughMultiTermCoverage)) {
    return {
      score: 0,
      debug: {
        matchedTerms,
        matchedCount,
        totalTerms: terms.length,
        coverageRatio: Number(coverageRatio.toFixed(2)),
        phraseField,
        orderedField,
        reasons,
      },
    };
  }

  return {
    score,
    debug: {
      matchedTerms,
      matchedCount,
      totalTerms: terms.length,
      coverageRatio: Number(coverageRatio.toFixed(2)),
      phraseField,
      orderedField,
      reasons,
    },
  };
}
