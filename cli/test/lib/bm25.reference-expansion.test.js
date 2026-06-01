import { describe, expect, it } from 'vitest';
import { buildIndex, searchWithStats } from '../../src/lib/bm25.js';

describe('bm25 reference-aware document expansion', () => {
  it('surfaces reference-file topics in the first-pass sparse retriever', () => {
    const index = buildIndex([
      {
        id: 'langchain/retrievers',
        name: 'LangChain Retrievers',
        description: 'Composable retrieval patterns and retriever abstractions.',
        tags: ['retrieval', 'langchain'],
        languages: [
          {
            language: 'python',
            recommendedVersion: '1.0',
            versions: [
              {
                version: '1.0',
                files: ['DOC.md', 'references/rrf.md', 'references/hnsw.md', 'references/multi-query.md'],
              },
            ],
          },
        ],
      },
      {
        id: 'stripe/webhooks',
        name: 'Stripe Webhooks',
        description: 'Verify webhook signatures and process events safely.',
        tags: ['payments', 'stripe'],
        languages: [
          {
            language: 'python',
            recommendedVersion: '1.0',
            versions: [
              {
                version: '1.0',
                files: ['DOC.md', 'references/raw-body.md', 'references/signature-verification.md'],
              },
            ],
          },
        ],
      },
      {
        id: 'react/hooks',
        name: 'React Hooks',
        description: 'State and lifecycle primitives for React.',
        tags: ['react'],
        languages: [
          {
            language: 'javascript',
            recommendedVersion: '1.0',
            versions: [
              {
                version: '1.0',
                files: ['DOC.md'],
              },
            ],
          },
        ],
      },
    ]);

    expect(searchWithStats('rrf', index).results[0].id).toBe('langchain/retrievers');
    expect(searchWithStats('hnsw', index).results[0].id).toBe('langchain/retrievers');
    expect(searchWithStats('raw body stripe', index).results[0].id).toBe('stripe/webhooks');
  });

  it('remains backward compatible with indexes that do not have expansion tokens', () => {
    const legacyIndex = {
      version: '1.0.0',
      algorithm: 'bm25',
      params: { k1: 1.5, b: 0.75 },
      totalDocs: 1,
      avgFieldLengths: { id: 2, name: 1, description: 2, tags: 1 },
      idf: { stripe: 0.2, webhook: 0.4 },
      documents: [
        {
          id: 'stripe/webhooks',
          tokens: {
            id: ['stripe', 'webhooks'],
            name: ['webhooks'],
            description: ['stripe', 'webhook'],
            tags: ['stripe'],
          },
        },
      ],
      invertedIndex: {
        stripe: [0],
        webhooks: [0],
        webhook: [0],
      },
    };

    expect(searchWithStats('stripe webhook', legacyIndex).results[0].id).toBe('stripe/webhooks');
  });
});
