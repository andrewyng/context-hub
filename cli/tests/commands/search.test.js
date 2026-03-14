import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

// Mock all dependencies before importing the module under test
vi.mock('../../src/lib/registry.js', () => ({
  searchEntries: vi.fn(() => []),
  listEntries: vi.fn(() => []),
  getEntry: vi.fn(() => ({})),
  getDisplayId: vi.fn((e) => e.id || e.name),
  isMultiSource: vi.fn(() => false),
}));
vi.mock('../../src/lib/normalize.js', () => ({
  displayLanguage: vi.fn((l) => l),
}));
vi.mock('../../src/lib/output.js', () => ({
  output: vi.fn((data, formatter, opts) => {
    if (opts?.json) {
      console.log(JSON.stringify(data));
    } else {
      formatter(data);
    }
  }),
}));
vi.mock('../../src/lib/analytics.js', () => ({
  trackEvent: vi.fn(() => Promise.resolve()),
}));

const { searchEntries, listEntries, getEntry, getDisplayId, isMultiSource } = await import('../../src/lib/registry.js');
const { trackEvent } = await import('../../src/lib/analytics.js');
const { output } = await import('../../src/lib/output.js');
const { registerSearchCommand } = await import('../../src/commands/search.js');

// Helper to invoke the command via Commander
async function runSearch(args = [], globalArgs = []) {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'JSON output');
  registerSearchCommand(program);
  await program.parseAsync(['node', 'test', ...globalArgs, 'search', ...args]);
}

// Sample entries for reuse
const docEntry = {
  id: 'acme/widgets',
  name: 'Widgets',
  _type: 'doc',
  _source: 'acme',
  description: 'Widget management library',
  tags: ['ui', 'components'],
  languages: [
    {
      language: 'javascript',
      recommendedVersion: '2.0',
      versions: [{ version: '2.0', size: 10240, lastUpdated: '2025-01-01' }],
    },
  ],
};

const skillEntry = {
  id: 'testskills/deploy',
  name: 'Deploy',
  _type: 'skill',
  _source: 'testskills',
  description: 'Deployment automation skill',
  tags: ['devops'],
  path: 'skills/deploy',
  size: 2048,
  lastUpdated: '2025-06-01',
  files: ['deploy.sh', 'config.yml'],
};

const longDescEntry = {
  id: 'verbose/thing',
  name: 'Verbose',
  _type: 'doc',
  _source: 'verbose',
  description: 'This is an extremely long description that definitely exceeds the sixty character truncation limit for list display',
  languages: [],
};

describe('search command', () => {
  let logSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  // ── Path 1: No query (list all) ──────────────────────────────

  describe('no query — list all', () => {
    it('calls listEntries with parsed filter options', async () => {
      listEntries.mockReturnValue([]);
      await runSearch(['--tags', 'ui', '--lang', 'js']);
      expect(listEntries).toHaveBeenCalledWith(
        expect.objectContaining({ tags: 'ui', lang: 'js' }),
      );
    });

    it('prints "No entries found." when list is empty', async () => {
      listEntries.mockReturnValue([]);
      await runSearch([]);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No entries found.'));
    });

    it('prints entry count and formatted list when entries exist', async () => {
      listEntries.mockReturnValue([docEntry, skillEntry]);
      await runSearch([]);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('2 entries:'));
    });

    it('respects --limit option to slice results', async () => {
      listEntries.mockReturnValue([docEntry, skillEntry, longDescEntry]);
      await runSearch(['--limit', '1']);
      // output() should receive only 1 entry
      expect(output).toHaveBeenCalledWith(
        expect.objectContaining({ total: 1 }),
        expect.any(Function),
        expect.anything(),
      );
    });

    it('defaults limit to 20', async () => {
      const manyEntries = Array.from({ length: 25 }, (_, i) => ({
        ...docEntry,
        id: `entry-${i}`,
      }));
      listEntries.mockReturnValue(manyEntries);
      await runSearch([]);
      expect(output).toHaveBeenCalledWith(
        expect.objectContaining({ total: 20 }),
        expect.any(Function),
        expect.anything(),
      );
    });

    it('passes json: true through output() in JSON mode', async () => {
      listEntries.mockReturnValue([docEntry]);
      await runSearch([], ['--json']);
      expect(output).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Function),
        expect.objectContaining({ json: true }),
      );
    });
  });

  // ── Path 2: Exact ID match ───────────────────────────────────

  describe('exact ID match', () => {
    it('shows detail view for single match', async () => {
      getEntry.mockReturnValue({ entry: docEntry });
      await runSearch(['acme/widgets']);
      expect(output).toHaveBeenCalledWith(
        docEntry,
        expect.any(Function),
        expect.anything(),
      );
    });

    it('prints entry name, description, tags in detail view', async () => {
      getEntry.mockReturnValue({ entry: docEntry });
      await runSearch(['acme/widgets']);
      // The formatter passed to output will be called — verify console output
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Widgets'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ui, components'));
    });

    it('prints alternatives for ambiguous match', async () => {
      getEntry.mockReturnValue({
        ambiguous: true,
        alternatives: ['src1/widgets', 'src2/widgets'],
      });
      await runSearch(['widgets']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('src1/widgets'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('src2/widgets'));
    });

    it('does NOT fall through to fuzzy search on exact match', async () => {
      getEntry.mockReturnValue({ entry: docEntry });
      await runSearch(['acme/widgets']);
      expect(searchEntries).not.toHaveBeenCalled();
    });

    it('does NOT fall through to fuzzy search on ambiguous match', async () => {
      getEntry.mockReturnValue({
        ambiguous: true,
        alternatives: ['a', 'b'],
      });
      await runSearch(['widgets']);
      expect(searchEntries).not.toHaveBeenCalled();
    });
  });

  // ── Path 3: Fuzzy search ─────────────────────────────────────

  describe('fuzzy search', () => {
    beforeEach(() => {
      getEntry.mockReturnValue({});
    });

    it('calls searchEntries when getEntry returns no match', async () => {
      searchEntries.mockReturnValue([docEntry]);
      await runSearch(['widget']);
      expect(searchEntries).toHaveBeenCalledWith('widget', expect.anything());
    });

    it('fires analytics event with correct properties', async () => {
      searchEntries.mockReturnValue([docEntry]);
      await runSearch(['widget', '--tags', 'ui']);
      expect(trackEvent).toHaveBeenCalledWith('search', {
        query_length: 6,
        result_count: 1,
        has_tags: true,
        has_lang: false,
      });
    });

    it('does not fail when trackEvent rejects', async () => {
      searchEntries.mockReturnValue([docEntry]);
      trackEvent.mockReturnValue(Promise.reject(new Error('network')));
      // Should not throw
      await runSearch(['widget']);
      expect(trackEvent).toHaveBeenCalled();
    });

    it('prints "No results for..." when empty', async () => {
      searchEntries.mockReturnValue([]);
      await runSearch(['xyznonexist']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No results for'));
    });

    it('prints result count and query in header', async () => {
      searchEntries.mockReturnValue([docEntry, skillEntry]);
      await runSearch(['widget']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('2 results for "widget"'));
    });

    it('respects --limit on fuzzy results', async () => {
      searchEntries.mockReturnValue([docEntry, skillEntry, longDescEntry]);
      await runSearch(['widget', '--limit', '2']);
      expect(output).toHaveBeenCalledWith(
        expect.objectContaining({ total: 2 }),
        expect.any(Function),
        expect.anything(),
      );
    });
  });

  // ── Formatting ───────────────────────────────────────────────

  describe('formatEntryList', () => {
    it('shows source label when isMultiSource() is true', async () => {
      isMultiSource.mockReturnValue(true);
      listEntries.mockReturnValue([docEntry]);
      await runSearch([]);
      // Source name should appear in output
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('acme'));
    });

    it('truncates descriptions longer than 60 chars', async () => {
      listEntries.mockReturnValue([longDescEntry]);
      await runSearch([]);
      const descCall = logSpy.mock.calls.find((c) =>
        typeof c[0] === 'string' && c[0].includes('...'),
      );
      expect(descCall).toBeTruthy();
      // The truncated portion should be 57 chars + '...'
      const descLine = descCall[0];
      expect(descLine).toContain('...');
      expect(descLine).not.toContain('truncation limit for list display');
    });
  });

  describe('formatEntryDetail', () => {
    it('prints language versions for doc entries', async () => {
      getEntry.mockReturnValue({ entry: docEntry });
      await runSearch(['acme/widgets']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('javascript'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('2.0'));
    });

    it('prints path and files for skill entries', async () => {
      getEntry.mockReturnValue({ entry: skillEntry });
      await runSearch(['testskills/deploy']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('skills/deploy'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('deploy.sh, config.yml'));
    });
  });
});
