import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock analytics module — must be before any import that uses it
const trackCalls = [];
vi.mock('../../src/lib/analytics.js', () => ({
  trackEvent: vi.fn(async (event, props) => { trackCalls.push([event, props]); }),
  setCliVersion: vi.fn(),
  shutdownAnalytics: vi.fn(async () => {}),
}));

// Mock cache.fetchDoc so we can simulate network errors
const mockFetchDoc = vi.fn();
const mockFetchDocFull = vi.fn();
vi.mock('../../src/lib/cache.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchDoc: (...args) => mockFetchDoc.getMockImplementation() ? mockFetchDoc(...args) : actual.fetchDoc(...args),
    fetchDocFull: (...args) => mockFetchDocFull.getMockImplementation() ? mockFetchDocFull(...args) : actual.fetchDocFull(...args),
  };
});

import { handleGet, handleSearch } from '../../src/mcp/tools.js';

function parseResult(result) {
  return JSON.parse(result.content[0].text);
}

describe('get command telemetry', () => {
  beforeEach(() => {
    trackCalls.length = 0;
  });

  it('emits doc_not_found with entry_id when entry does not exist', async () => {
    await handleGet({ id: 'nonexistent/entry-xyz-999' });

    const call = trackCalls.find(([event]) => event === 'doc_not_found');
    expect(call).toBeDefined();
    expect(call[1].entry_id).toBe('nonexistent/entry-xyz-999');
    expect(call[1]).toHaveProperty('via', 'mcp');
    expect(call[1]).not.toHaveProperty('error_message');
  });

  it('emits doc_fetched with duration_ms on successful fetch', async () => {
    const searchResult = await handleSearch({ limit: 1 });
    const data = parseResult(searchResult);
    if (data.results.length === 0) return;

    const entry = data.results[0];
    const lang = entry.languages?.[0];
    trackCalls.length = 0;
    await handleGet({ id: entry.id, lang });

    const fetchCall = trackCalls.find(
      ([event]) => event === 'doc_fetched' || event === 'skill_fetched'
    );
    if (fetchCall) {
      const props = fetchCall[1];
      expect(props).toHaveProperty('entry_id');
      expect(props).toHaveProperty('duration_ms');
      expect(typeof props.duration_ms).toBe('number');
      expect(props.duration_ms).toBeGreaterThanOrEqual(0);
      expect(props).toHaveProperty('via', 'mcp');
      expect(props).not.toHaveProperty('error_message');
    }
  });

  it('duration_ms is reasonable per entry', async () => {
    const searchResult = await handleSearch({ limit: 2 });
    const data = parseResult(searchResult);
    if (data.results.length < 1) return;

    for (const entry of data.results) {
      trackCalls.length = 0;
      const lang = entry.languages?.[0];
      await handleGet({ id: entry.id, lang });

      const fetchCall = trackCalls.find(
        ([event]) => event === 'doc_fetched' || event === 'skill_fetched'
      );
      if (fetchCall) {
        expect(fetchCall[1].duration_ms).toBeGreaterThanOrEqual(0);
        expect(fetchCall[1].duration_ms).toBeLessThan(10000);
      }
    }
  });

  it('never sends error_message in any telemetry event', async () => {
    await handleSearch({ query: 'test' });
    await handleGet({ id: 'nonexistent/entry-999' });

    for (const [, props] of trackCalls) {
      expect(props).not.toHaveProperty('error_message');
    }
  });

  it('fetch_error contains error_type but not error_message', async () => {
    // Make fetchDoc throw to hit the catch path that emits fetch_error
    mockFetchDoc.mockImplementation(async () => {
      const e = new Error('connect ECONNREFUSED');
      e.code = 'ECONNREFUSED';
      throw e;
    });

    try {
      const searchResult = await handleSearch({ limit: 1 });
      const data = parseResult(searchResult);
      if (data.results.length === 0) return;

      const entry = data.results[0];
      const lang = entry.languages?.[0];
      trackCalls.length = 0;
      await handleGet({ id: entry.id, lang });

      const errorCall = trackCalls.find(([event]) => event === 'fetch_error');
      expect(errorCall).toBeDefined();
      expect(errorCall[1]).toHaveProperty('error_type', 'ECONNREFUSED');
      expect(errorCall[1]).toHaveProperty('via', 'mcp');
      expect(errorCall[1]).not.toHaveProperty('error_message');
    } finally {
      mockFetchDoc.mockReset();
    }
  });
});
