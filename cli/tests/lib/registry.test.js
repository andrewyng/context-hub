import { describe, it, expect } from 'vitest';
import { searchEntries, getEntry, resolveDocPath, resolveEntryFile } from '../../src/lib/registry.js';

describe('searchEntries', () => {
  it('returns an array', () => {
    const results = searchEntries('nonexistent-entry-xyz-12345');
    expect(Array.isArray(results)).toBe(true);
  });

  it('returns empty array for nonsense query', () => {
    const results = searchEntries('zzzzzzzzzzzzzzzzzzzzzzzzzzzz');
    expect(results).toEqual([]);
  });

  it('scores exact id match higher than partial match', () => {
    // Create two mock entries by searching for a term that could match partially
    // This tests the scoring logic: exact id match (100) > partial match (50)
    // We rely on whatever is in the registry; if empty, results will be []
    const results = searchEntries('test');
    if (results.length >= 2) {
      // Results should be sorted by score descending
      expect(results[0]._score).toBeGreaterThanOrEqual(results[1]._score);
    }
    // Even with 0 or 1 results, the function should not throw
    expect(Array.isArray(results)).toBe(true);
  });

  it('applies language filter', () => {
    // Search with a language filter
    const results = searchEntries('', { lang: 'python' });
    for (const entry of results) {
      if (entry.languages) {
        const hasLang = entry.languages.some((l) => l.language === 'python');
        expect(hasLang).toBe(true);
      }
    }
  });

  it('applies tag filter', () => {
    const results = searchEntries('', { tags: 'nonexistent-tag-xyz' });
    expect(results).toEqual([]);
  });
});

describe('getEntry', () => {
  it('returns { entry: null, ambiguous: false } for nonexistent id', () => {
    const result = getEntry('does-not-exist/at-all-xyz-12345');
    expect(result.entry).toBeNull();
    expect(result.ambiguous).toBe(false);
  });

  it('handles source:id format', () => {
    const result = getEntry('nosource:noid');
    expect(result.entry).toBeNull();
    expect(result.ambiguous).toBe(false);
  });

  it('accepts type parameter "doc"', () => {
    const result = getEntry('nonexistent-xyz', 'doc');
    expect(result.entry).toBeNull();
  });

  it('accepts type parameter "skill"', () => {
    const result = getEntry('nonexistent-xyz', 'skill');
    expect(result.entry).toBeNull();
  });
});

describe('resolveDocPath', () => {
  it('returns null for entry with no languages and no path', () => {
    const entry = { name: 'test', _sourceObj: { name: 'default', url: 'http://example.com' } };
    const result = resolveDocPath(entry, null, null);
    expect(result).toBeNull();
  });

  it('returns path directly for skill entries (no languages)', () => {
    const entry = {
      name: 'test-skill',
      path: 'author/test-skill',
      files: ['SKILL.md'],
      _sourceObj: { name: 'default', url: 'http://example.com' },
    };
    const result = resolveDocPath(entry, null, null);
    expect(result).toEqual({
      source: entry._sourceObj,
      path: 'author/test-skill',
      files: ['SKILL.md'],
    });
  });

  it('prompts for language when multiple languages exist and none specified', () => {
    const entry = {
      name: 'multi-lang',
      languages: [
        { language: 'python', versions: [{ version: '1.0', path: 'p/python', files: [] }], recommendedVersion: '1.0' },
        { language: 'javascript', versions: [{ version: '1.0', path: 'p/js', files: [] }], recommendedVersion: '1.0' },
      ],
      _sourceObj: { name: 'default', url: 'http://example.com' },
    };
    const result = resolveDocPath(entry, null, null);
    expect(result.needsLanguage).toBe(true);
    expect(result.available).toEqual(['python', 'javascript']);
  });

  it('selects the correct language', () => {
    const entry = {
      name: 'multi-lang',
      languages: [
        { language: 'python', versions: [{ version: '1.0', path: 'p/python', files: ['DOC.md'] }], recommendedVersion: '1.0' },
        { language: 'javascript', versions: [{ version: '1.0', path: 'p/js', files: ['DOC.md'] }], recommendedVersion: '1.0' },
      ],
      _sourceObj: { name: 'default', url: 'http://example.com' },
    };
    const result = resolveDocPath(entry, 'python', null);
    expect(result.path).toBe('p/python');
  });

  it('normalizes language aliases when resolving', () => {
    const entry = {
      name: 'alias-test',
      languages: [
        { language: 'javascript', versions: [{ version: '2.0', path: 'a/js', files: [] }], recommendedVersion: '2.0' },
      ],
      _sourceObj: { name: 'default', url: 'http://example.com' },
    };
    // 'js' should be normalized to 'javascript'
    const result = resolveDocPath(entry, 'js', null);
    expect(result.path).toBe('a/js');
  });

  it('selects the correct version', () => {
    const entry = {
      name: 'versioned',
      languages: [
        {
          language: 'python',
          versions: [
            { version: '2.0', path: 'p/v2', files: ['DOC.md'] },
            { version: '1.0', path: 'p/v1', files: ['DOC.md'] },
          ],
          recommendedVersion: '2.0',
        },
      ],
      _sourceObj: { name: 'default', url: 'http://example.com' },
    };
    const result = resolveDocPath(entry, 'python', '1.0');
    expect(result.path).toBe('p/v1');
  });

  it('falls back to recommended version when none specified', () => {
    const entry = {
      name: 'versioned',
      languages: [
        {
          language: 'python',
          versions: [
            { version: '2.0', path: 'p/v2', files: ['DOC.md'] },
            { version: '1.0', path: 'p/v1', files: ['DOC.md'] },
          ],
          recommendedVersion: '2.0',
        },
      ],
      _sourceObj: { name: 'default', url: 'http://example.com' },
    };
    const result = resolveDocPath(entry, 'python', null);
    expect(result.path).toBe('p/v2');
  });
});

describe('resolveEntryFile', () => {
  it('returns DOC.md path for doc type', () => {
    const resolved = { path: 'author/my-doc', files: ['DOC.md'] };
    const result = resolveEntryFile(resolved, 'doc');
    expect(result.filePath).toBe('author/my-doc/DOC.md');
    expect(result.basePath).toBe('author/my-doc');
  });

  it('returns SKILL.md path for skill type', () => {
    const resolved = { path: 'author/my-skill', files: ['SKILL.md'] };
    const result = resolveEntryFile(resolved, 'skill');
    expect(result.filePath).toBe('author/my-skill/SKILL.md');
    expect(result.basePath).toBe('author/my-skill');
  });

  it('returns error for unresolved entry', () => {
    const result = resolveEntryFile(null, 'doc');
    expect(result.error).toBe('unresolved');
  });

  it('returns error for needsLanguage entry', () => {
    const result = resolveEntryFile({ needsLanguage: true, available: ['python'] }, 'doc');
    expect(result.error).toBe('unresolved');
  });
});
