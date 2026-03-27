import { describe, it, expect } from 'vitest';
import { buildIndex, searchWithStats } from '../../src/lib/bm25.js';

describe('bm25 inverted index', () => {
  it('stores postings lists for searchable terms', () => {
    const index = buildIndex([
      {
        id: 'acme/widgets',
        name: 'Widget API',
        description: 'Create and list widgets',
        tags: ['widgets', 'api'],
      },
      {
        id: 'acme/deploy',
        name: 'Deploy Skill',
        description: 'Deploy widgets safely',
        tags: ['deploy'],
      },
    ]);

    expect(index.invertedIndex.widget).toEqual([0]);
    expect(index.invertedIndex.widgets).toEqual([0, 1]);
    expect(index.invertedIndex.deploy).toEqual([1]);
    expect(index.invertedIndex.api).toEqual([0]);
  });

  it('returns the same search results while scoring fewer documents', () => {
    const entries = Array.from({ length: 1000 }, (_, idx) => ({
      id: `vendor/entry-${idx}`,
      name: `Entry ${idx}`,
      description: idx < 8 ? `Rare needle topic ${idx}` : `Common background topic ${idx}`,
      tags: idx < 8 ? ['needle'] : ['background'],
    }));

    const optimizedIndex = buildIndex(entries);
    const baselineIndex = { ...optimizedIndex };
    delete baselineIndex.invertedIndex;

    const optimized = searchWithStats('needle', optimizedIndex);
    const baseline = searchWithStats('needle', baselineIndex);

    expect(optimized.results).toEqual(baseline.results);
    expect(optimized.stats.usedInvertedIndex).toBe(true);
    expect(baseline.stats.usedInvertedIndex).toBe(false);
    expect(optimized.stats.candidateDocCount).toBe(8);
    expect(baseline.stats.candidateDocCount).toBe(1000);
    expect(optimized.stats.scoredDocCount).toBeLessThan(baseline.stats.scoredDocCount);
  });

  it('skips scoring entirely when no postings match the query', () => {
    const index = buildIndex([
      {
        id: 'vendor/alpha',
        name: 'Alpha',
        description: 'Alpha topic',
        tags: ['alpha'],
      },
      {
        id: 'vendor/beta',
        name: 'Beta',
        description: 'Beta topic',
        tags: ['beta'],
      },
    ]);

    const result = searchWithStats('gamma', index);

    expect(result.results).toEqual([]);
    expect(result.stats.candidateDocCount).toBe(0);
    expect(result.stats.scoredDocCount).toBe(0);
  });

  it('indexes identifier variants so joined and split package queries still match', () => {
    const index = buildIndex([
      {
        id: 'node-fetch/node-fetch',
        name: 'node-fetch',
        description: 'Fetch API for Node.js',
        tags: ['http'],
      },
      {
        id: 'auth0/identity',
        name: 'Auth0 Identity',
        description: 'Identity toolkit',
        tags: ['auth'],
      },
    ]);

    expect(searchWithStats('nodefetch', index).results[0].id).toBe('node-fetch/node-fetch');
    expect(searchWithStats('auth 0', index).results[0].id).toBe('auth0/identity');
  });
});
