import { readFileSync } from 'node:fs';
import { scoreEntryCoverageBoost, scoreKeywordFallback } from '../src/lib/relevance.js';

const fixturePath = new URL('../test/fixtures/relevance-benchmark.json', import.meta.url);
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

function rankEntries(catalog, query, includeCoverage) {
  return catalog
    .map((entry) => {
      const base = scoreKeywordFallback(entry, query);
      const coverage = includeCoverage ? scoreEntryCoverageBoost(entry, query).score : 0;
      return {
        id: entry.id,
        base,
        coverage,
        total: base + coverage,
      };
    })
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total || b.coverage - a.coverage || a.id.localeCompare(b.id));
}

let improvedPasses = 0;
console.log('Context Hub relevance benchmark\n');

for (const scenario of fixture.scenarios) {
  const baseline = rankEntries(fixture.catalog, scenario.query, false);
  const improved = rankEntries(fixture.catalog, scenario.query, true);
  const baselineTop = baseline[0]?.id || '(none)';
  const improvedTop = improved[0]?.id || '(none)';
  const passed = improvedTop === scenario.expectedTop;
  if (passed) improvedPasses += 1;

  console.log(`query: ${scenario.query}`);
  console.log(`  baseline top: ${baselineTop}`);
  console.log(`  improved top: ${improvedTop}${passed ? ' ✓' : ` ✗ (expected ${scenario.expectedTop})`}`);
  console.log(`  improved top 3: ${improved.slice(0, 3).map((entry) => entry.id).join(', ')}`);
  console.log('');
}

console.log(`Improved pass rate: ${improvedPasses}/${fixture.scenarios.length}`);
