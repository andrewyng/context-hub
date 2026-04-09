import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { scoreEntryCoverageBoost, scoreKeywordFallback } from '../src/lib/relevance.js';

const fixturePath = new URL('./fixtures/relevance-benchmark.json', import.meta.url);
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

function rankEntries(catalog, query, includeCoverage) {
  return catalog
    .map((entry) => {
      const base = scoreKeywordFallback(entry, query);
      const coverage = includeCoverage ? scoreEntryCoverageBoost(entry, query).score : 0;
      return {
        id: entry.id,
        total: base + coverage,
      };
    })
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));
}

describe('search relevance coverage boost', () => {
  it('prefers full multi-term coverage over single-entry authority', () => {
    const results = rankEntries(fixture.catalog, 'stripe payments', true);
    expect(results[0].id).toBe('stripe/payments');
  });

  it('recognizes ordered phrase matches for multi-word queries', () => {
    const entry = fixture.catalog.find((item) => item.id === 'protocol/mcp-overview');
    const { score, debug } = scoreEntryCoverageBoost(entry, 'model context protocol');
    expect(score).toBeGreaterThan(0);
    expect(debug.reasons).toContain('phrase:name');
  });

  it('supports acronym rescue for single-term queries', () => {
    const entry = fixture.catalog.find((item) => item.id === 'protocol/mcp-overview');
    const { score, debug } = scoreEntryCoverageBoost(entry, 'mcp');
    expect(score).toBeGreaterThan(0);
    expect(debug.reasons).toContain('acronym:mcp');
  });

  it('meets the expected top result for every benchmark scenario', () => {
    for (const scenario of fixture.scenarios) {
      const results = rankEntries(fixture.catalog, scenario.query, true);
      expect(results[0]?.id).toBe(scenario.expectedTop);
    }
  });
});
