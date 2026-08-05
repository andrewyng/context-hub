import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/lib/cache.js', () => ({
  getCacheStats: vi.fn(),
  clearCache: vi.fn(),
}));
vi.mock('../../src/lib/output.js', () => ({
  output: vi.fn((data, formatter, opts) => {
    if (opts?.json) console.log(JSON.stringify(data));
    else formatter(data);
  }),
}));

const { getCacheStats, clearCache } = await import('../../src/lib/cache.js');
const { output } = await import('../../src/lib/output.js');
const { registerCacheCommand } = await import('../../src/commands/cache.js');

async function runCache(args = [], globalArgs = []) {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'JSON output');
  registerCacheCommand(program);
  await program.parseAsync(['node', 'test', ...globalArgs, 'cache', ...args]);
}

describe('cache status', () => {
  let logSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('prints "No cache found." when cache does not exist', async () => {
    getCacheStats.mockReturnValue({ exists: false, sources: [] });
    await runCache(['status']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No cache found'));
  });

  it('prints "No cache found." when cache is empty', async () => {
    getCacheStats.mockReturnValue({ exists: true, sources: [] });
    await runCache(['status']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No cache found'));
  });

  it('prints local source with path', async () => {
    getCacheStats.mockReturnValue({
      exists: true,
      sources: [{ name: 'local-src', type: 'local', path: '/tmp/local' }],
    });
    await runCache(['status']);
    const calls = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(calls).toMatch(/local-src/);
    expect(calls).toMatch(/\/tmp\/local/);
  });

  it('prints remote source with registry/files/size details', async () => {
    getCacheStats.mockReturnValue({
      exists: true,
      sources: [{
        name: 'maintainer',
        type: 'remote',
        hasRegistry: true,
        lastUpdated: '2026-01-01',
        fullBundle: false,
        fileCount: 5,
        dataSize: 2048,
      }],
    });
    await runCache(['status']);
    const calls = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(calls).toMatch(/maintainer/);
    expect(calls).toMatch(/2026-01-01/);
    expect(calls).toMatch(/2\.0 KB/);
  });

  it('reports lastUpdated as "never" when missing', async () => {
    getCacheStats.mockReturnValue({
      exists: true,
      sources: [{
        name: 's', type: 'remote', hasRegistry: false,
        lastUpdated: null, fullBundle: false, fileCount: 0, dataSize: 0,
      }],
    });
    await runCache(['status']);
    const calls = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(calls).toMatch(/never/);
  });

  it('passes stats through output() with --json', async () => {
    getCacheStats.mockReturnValue({ exists: true, sources: [] });
    await runCache(['status'], ['--json']);
    expect(output).toHaveBeenCalledWith(
      expect.objectContaining({ exists: true }),
      expect.any(Function),
      expect.objectContaining({ json: true }),
    );
  });
});

describe('cache clear', () => {
  let logSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('calls clearCache() and reports success', async () => {
    await runCache(['clear']);
    expect(clearCache).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Cache cleared'));
  });

  it('passes status:cleared through output()', async () => {
    await runCache(['clear']);
    expect(output).toHaveBeenCalledWith(
      { status: 'cleared' },
      expect.any(Function),
      expect.anything(),
    );
  });

  it('respects --json by passing through output()', async () => {
    await runCache(['clear'], ['--json']);
    expect(output).toHaveBeenCalledWith(
      { status: 'cleared' },
      expect.any(Function),
      expect.objectContaining({ json: true }),
    );
  });
});
