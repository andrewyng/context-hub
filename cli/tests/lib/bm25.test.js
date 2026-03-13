import { describe, it, expect } from 'vitest';
import { tokenize, buildIndex, search } from '../../src/lib/bm25.js';

describe('bm25', () => {
  describe('tokenize', () => {
    it('lowercases and splits on whitespace', () => {
      expect(tokenize('Hello World')).toEqual(['hello', 'world']);
    });

    it('removes stop words', () => {
      expect(tokenize('the quick and brown fox')).toEqual(['quick', 'brown', 'fox']);
    });

    it('removes punctuation', () => {
      expect(tokenize('hello, world! foo-bar')).toEqual(['hello', 'world', 'foo', 'bar']);
    });

    it('removes single-character tokens', () => {
      expect(tokenize('a b cd ef')).toEqual(['cd', 'ef']);
    });

    it('returns empty array for empty/null input', () => {
      expect(tokenize('')).toEqual([]);
      expect(tokenize(null)).toEqual([]);
      expect(tokenize(undefined)).toEqual([]);
    });
  });

  describe('buildIndex', () => {
    const entries = [
      { id: 'stripe/api', name: 'api', description: 'Payment processing platform', tags: ['stripe', 'payments'] },
      { id: 'openai/chat', name: 'chat', description: 'Chat completions API', tags: ['openai', 'ai', 'chat'] },
      { id: 'redis/cache', name: 'cache', description: 'In-memory data store', tags: ['redis', 'cache', 'database'] },
    ];

    it('builds index with correct structure', () => {
      const index = buildIndex(entries);
      expect(index.version).toBe('1.0.0');
      expect(index.algorithm).toBe('bm25');
      expect(index.totalDocs).toBe(3);
      expect(index.documents).toHaveLength(3);
      expect(index.params).toEqual({ k1: 1.5, b: 0.75 });
    });

    it('tokenizes all fields', () => {
      const index = buildIndex(entries);
      const stripeDoc = index.documents.find((d) => d.id === 'stripe/api');
      expect(stripeDoc.tokens.name).toEqual(['api']);
      expect(stripeDoc.tokens.description).toContain('payment');
      expect(stripeDoc.tokens.description).toContain('processing');
      expect(stripeDoc.tokens.tags).toContain('stripe');
      expect(stripeDoc.tokens.tags).toContain('payments');
    });

    it('computes IDF values', () => {
      const index = buildIndex(entries);
      expect(index.idf).toBeDefined();
      // 'payment' appears in 1 of 3 docs — should have higher IDF than 'api' if it appeared in more
      expect(index.idf['payment']).toBeGreaterThan(0);
    });

    it('computes average field lengths', () => {
      const index = buildIndex(entries);
      expect(index.avgFieldLengths.name).toBeGreaterThan(0);
      expect(index.avgFieldLengths.description).toBeGreaterThan(0);
      expect(index.avgFieldLengths.tags).toBeGreaterThan(0);
    });

    it('handles empty entries array', () => {
      const index = buildIndex([]);
      expect(index.totalDocs).toBe(0);
      expect(index.documents).toHaveLength(0);
    });
  });

  describe('search', () => {
    const entries = [
      { id: 'stripe/api', name: 'api', description: 'Payment processing platform with billing', tags: ['stripe', 'payments', 'billing'] },
      { id: 'openai/chat', name: 'chat', description: 'Chat completions API for language models', tags: ['openai', 'ai', 'chat'] },
      { id: 'redis/cache', name: 'cache', description: 'In-memory data store for caching', tags: ['redis', 'cache', 'database'] },
      { id: 'square/payments', name: 'payments', description: 'Payment processing for commerce', tags: ['square', 'payments', 'commerce'] },
    ];

    const index = buildIndex(entries);

    it('finds entries by keyword match', () => {
      const results = search('payment', index);
      expect(results.length).toBeGreaterThan(0);
      const ids = results.map((r) => r.id);
      expect(ids).toContain('stripe/api');
      expect(ids).toContain('square/payments');
    });

    it('ranks exact name match higher', () => {
      const results = search('payments', index);
      // 'square/payments' has 'payments' as its name — should rank high
      expect(results[0].id).toBe('square/payments');
    });

    it('finds by tag', () => {
      const results = search('database', index);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('redis/cache');
    });

    it('finds by description terms', () => {
      const results = search('language models', index);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('openai/chat');
    });

    it('returns empty for no match', () => {
      const results = search('nonexistent thing', index);
      expect(results).toHaveLength(0);
    });

    it('handles multi-word queries', () => {
      const results = search('payment processing', index);
      expect(results.length).toBeGreaterThan(0);
      // Both stripe and square have 'payment processing' in description
      const ids = results.map((r) => r.id);
      expect(ids).toContain('stripe/api');
      expect(ids).toContain('square/payments');
    });

    it('respects limit option', () => {
      const results = search('payment', index, { limit: 1 });
      expect(results).toHaveLength(1);
    });

    it('returns empty for stop-words-only query', () => {
      const results = search('the and is', index);
      expect(results).toHaveLength(0);
    });
  });

  describe('search quality report', () => {
    const entries = [
      { id: 'stripe/api', name: 'api', description: 'Payment processing platform with billing and subscriptions', tags: ['stripe', 'payments', 'billing'] },
      { id: 'square/payments', name: 'payments', description: 'Payment processing for commerce and point of sale', tags: ['square', 'payments', 'commerce'] },
      { id: 'openai/chat', name: 'chat', description: 'Chat completions API for language models and AI assistants', tags: ['openai', 'ai', 'chat', 'llm'] },
      { id: 'redis/cache', name: 'cache', description: 'In-memory data store for caching and session management', tags: ['redis', 'cache', 'database'] },
      { id: 'mongodb/driver', name: 'driver', description: 'Document database driver for storing and querying JSON data', tags: ['mongodb', 'database', 'nosql'] },
      { id: 'auth0/identity', name: 'identity', description: 'Authentication and authorization platform with SSO and MFA', tags: ['auth0', 'auth', 'identity', 'sso'] },
      { id: 'clerk/auth', name: 'auth', description: 'User authentication with social login and session management', tags: ['clerk', 'auth', 'login'] },
      { id: 'playwright/testing', name: 'testing', description: 'Browser automation for end-to-end testing of web applications', tags: ['playwright', 'testing', 'browser', 'automation'] },
      { id: 'sentry/errors', name: 'errors', description: 'Error monitoring and performance tracking for production apps', tags: ['sentry', 'errors', 'monitoring'] },
      { id: 'twilio/messaging', name: 'messaging', description: 'SMS and messaging API for sending notifications', tags: ['twilio', 'sms', 'messaging'] },
    ];

    const index = buildIndex(entries);

    const queries = [
      'payment processing',
      'database',
      'authentication login',
      'browser testing',
      'error monitoring',
      'send SMS',
      'AI language model',
      'caching',
      'subscriptions billing',
      'JSON document store',
    ];

    it('generates visual search quality report', () => {
      const lines = ['\n  ┌─────────────────────────────────────────────────────────────────┐'];
      lines.push('  │                    BM25 SEARCH QUALITY REPORT                  │');
      lines.push('  └─────────────────────────────────────────────────────────────────┘\n');

      for (const query of queries) {
        const results = search(query, index);
        lines.push(`  Query: "${query}"`);
        if (results.length === 0) {
          lines.push('    (no results)');
        } else {
          for (const r of results.slice(0, 5)) {
            const bar = '█'.repeat(Math.min(Math.round(r.score * 2), 30));
            lines.push(`    ${r.score.toFixed(2).padStart(6)}  ${bar}  ${r.id}`);
          }
        }
        lines.push('');
      }

      // Print to console so it's visible in test output
      console.log(lines.join('\n'));

      // The test itself just verifies search runs without error
      expect(true).toBe(true);
    });
  });
});
