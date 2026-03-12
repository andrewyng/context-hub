import { describe, it, expect, afterEach } from 'vitest';
import { handleSearch, handleGet, handleList, handleAnnotate, handleFeedback } from '../../src/mcp/tools.js';

/**
 * Helper to parse the JSON text from an MCP tool result.
 */
function parseResult(result) {
  return JSON.parse(result.content[0].text);
}

describe('chub_search (handleSearch)', () => {
  it('returns results array for a valid query', async () => {
    const result = await handleSearch({ query: 'stripe', limit: 5 });
    const data = parseResult(result);
    expect(data).toHaveProperty('results');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.results)).toBe(true);
  });

  it('lists all entries when no query is provided', async () => {
    const result = await handleSearch({ limit: 200 });
    const data = parseResult(result);
    expect(data.total).toBeGreaterThanOrEqual(0);
  });

  it('respects limit parameter', async () => {
    const result = await handleSearch({ limit: 2 });
    const data = parseResult(result);
    expect(data.results.length).toBeLessThanOrEqual(2);
  });

  it('returns simplified entry shape', async () => {
    const result = await handleSearch({ limit: 1 });
    const data = parseResult(result);
    if (data.results.length > 0) {
      const entry = data.results[0];
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('type');
      expect(entry).toHaveProperty('description');
      expect(entry).toHaveProperty('tags');
      // Should not contain internal fields
      expect(entry).not.toHaveProperty('_source');
      expect(entry).not.toHaveProperty('_sourceObj');
      expect(entry).not.toHaveProperty('_score');
    }
  });

  it('returns empty results for nonsense query', async () => {
    const result = await handleSearch({ query: 'zzz-no-match-xyz-99999', limit: 10 });
    const data = parseResult(result);
    expect(data.results).toEqual([]);
    expect(data.total).toBe(0);
  });
});

describe('chub_get (handleGet)', () => {
  it('returns error for nonexistent entry', async () => {
    const result = await handleGet({ id: 'does-not-exist/xyz-99999' });
    expect(result.isError).toBe(true);
    const data = parseResult(result);
    expect(data.error).toContain('not found');
  });

  it('returns doc content as text', async () => {
    // Use a known entry from the registry
    const searchResult = await handleSearch({ limit: 1 });
    const entries = parseResult(searchResult);
    if (entries.results.length === 0) return; // skip if no registry

    const id = entries.results[0].id;
    const result = await handleGet({ id });

    if (!result.isError) {
      const text = result.content[0].text;
      expect(text.length).toBeGreaterThan(0);
      expect(typeof text).toBe('string');
    }
  });

  it('returns error when language is needed', async () => {
    // Find a multi-language entry
    const listResult = await handleList({ limit: 500 });
    const data = parseResult(listResult);
    const multiLang = data.entries.find((e) => e.languages && e.languages.length > 1);
    if (!multiLang) return; // skip if no multi-language entries

    const result = await handleGet({ id: multiLang.id });
    if (result.isError) {
      const err = parseResult(result);
      expect(err.available).toBeDefined();
    }
  });

  it('rejects path traversal in file parameter', async () => {
    const result = await handleGet({ id: 'stripe/api', file: '../../etc/passwd' });
    expect(result.isError).toBe(true);
    const data = parseResult(result);
    expect(data.error).toContain('traversal');
  });

  it('returns error for nonexistent file within entry', async () => {
    // Find a single-language entry and pass its language to avoid "needs language" errors
    const listResult = await handleList({ limit: 500 });
    const data = parseResult(listResult);
    const singleLang = data.entries.find((e) => e.languages && e.languages.length === 1);
    if (!singleLang) return;

    const lang = singleLang.languages[0];
    const result = await handleGet({ id: singleLang.id, lang, file: 'nonexistent-file-xyz.md' });
    expect(result.isError).toBe(true);
    const err = parseResult(result);
    expect(err.error).toContain('not found');
  });
});

describe('chub_list (handleList)', () => {
  it('returns entries array', async () => {
    const result = await handleList({ limit: 10 });
    const data = parseResult(result);
    expect(data).toHaveProperty('entries');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.entries)).toBe(true);
  });

  it('respects limit', async () => {
    const result = await handleList({ limit: 3 });
    const data = parseResult(result);
    expect(data.entries.length).toBeLessThanOrEqual(3);
  });

  it('filters by language', async () => {
    const result = await handleList({ lang: 'python', limit: 100 });
    const data = parseResult(result);
    for (const entry of data.entries) {
      if (entry.languages) {
        expect(entry.languages).toContain('python');
      }
    }
  });
});

describe('chub_annotate (handleAnnotate)', () => {
  const testId = '__mcp-test-annotation__/test';

  it('returns no_annotation for nonexistent entry', async () => {
    const result = await handleAnnotate({ id: testId });
    const data = parseResult(result);
    expect(data.status).toBe('no_annotation');
  });

  it('writes and reads an annotation', async () => {
    // Write
    const writeResult = await handleAnnotate({ id: testId, note: 'MCP test note' });
    const writeData = parseResult(writeResult);
    expect(writeData.status).toBe('saved');
    expect(writeData.annotation.note).toBe('MCP test note');

    // Read back
    const readResult = await handleAnnotate({ id: testId });
    const readData = parseResult(readResult);
    expect(readData.annotation.note).toBe('MCP test note');

    // Clean up
    await handleAnnotate({ id: testId, clear: true });
  });

  it('clears an annotation', async () => {
    await handleAnnotate({ id: testId, note: 'to be cleared' });
    const result = await handleAnnotate({ id: testId, clear: true });
    const data = parseResult(result);
    expect(data.status).toBe('cleared');
  });

  it('lists annotations', async () => {
    const result = await handleAnnotate({ id: 'ignored', list: true });
    const data = parseResult(result);
    expect(data).toHaveProperty('annotations');
    expect(Array.isArray(data.annotations)).toBe(true);
  });

  it('returns error when id is missing in non-list mode', async () => {
    const result = await handleAnnotate({});
    expect(result.isError).toBe(true);
    const data = parseResult(result);
    expect(data.error).toContain('Missing required parameter');
  });

  it('rejects entry ID with invalid characters', async () => {
    const result = await handleAnnotate({ id: 'test/<script>alert(1)</script>', note: 'xss' });
    expect(result.isError).toBe(true);
    const data = parseResult(result);
    expect(data.error).toContain('invalid characters');
  });

  it('rejects excessively long entry ID', async () => {
    const longId = 'a'.repeat(201);
    const result = await handleAnnotate({ id: longId, note: 'test' });
    expect(result.isError).toBe(true);
    const data = parseResult(result);
    expect(data.error).toContain('too long');
  });
});

describe('chub_feedback (handleFeedback)', () => {
  afterEach(() => {
    delete process.env.CHUB_FEEDBACK;
  });

  it('handles feedback without throwing', async () => {
    const result = await handleFeedback({
      id: 'test/entry',
      rating: 'up',
      comment: 'test from MCP',
    });
    expect(result).toHaveProperty('content');
    const data = parseResult(result);
    expect(['sent', 'skipped', 'error']).toContain(data.status);
  });

  it('returns skipped when feedback is disabled', async () => {
    process.env.CHUB_FEEDBACK = '0';
    const result = await handleFeedback({ id: 'test/entry', rating: 'up' });
    const data = parseResult(result);
    expect(data.status).toBe('skipped');
    expect(data.reason).toBe('feedback_disabled');
  });
});
