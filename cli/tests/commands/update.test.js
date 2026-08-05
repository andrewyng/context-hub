import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/lib/cache.js', () => ({
  fetchAllRegistries: vi.fn(),
  fetchFullBundle: vi.fn(),
}));
vi.mock('../../src/lib/config.js', () => ({
  loadConfig: vi.fn(),
}));
vi.mock('../../src/lib/output.js', () => ({
  output: vi.fn((data, formatter, opts) => {
    if (opts?.json) console.log(JSON.stringify(data));
    else formatter(data);
  }),
  info: vi.fn(),
}));

const { fetchAllRegistries, fetchFullBundle } = await import('../../src/lib/cache.js');
const { loadConfig } = await import('../../src/lib/config.js');
const { output, info } = await import('../../src/lib/output.js');
const { registerUpdateCommand } = await import('../../src/commands/update.js');

async function runUpdate(args = [], globalArgs = []) {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'JSON output');
  registerUpdateCommand(program);
  await program.parseAsync(['node', 'test', ...globalArgs, 'update', ...args]);
}

describe('chub update', () => {
  let logSpy, errSpy, exitSpy, stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`__exit__:${code}`);
    });
    loadConfig.mockReturnValue({ sources: [{ name: 'maintainer' }, { name: 'community' }] });
    fetchAllRegistries.mockResolvedValue([]);
  });

  afterEach(() => {
    logSpy.mockRestore();
    errSpy.mockRestore();
    stderrSpy.mockRestore();
    exitSpy.mockRestore();
  });

  describe('default mode (no flags)', () => {
    it('calls fetchAllRegistries and reports success', async () => {
      await runUpdate([]);
      expect(fetchAllRegistries).toHaveBeenCalled();
      expect(logSpy.mock.calls[0][0]).toMatch(/Registry updated/);
    });

    it('reports the count of updated remote sources', async () => {
      loadConfig.mockReturnValue({
        sources: [
          { name: 'maintainer' },         // remote
          { name: 'community' },          // remote
          { name: 'local', path: '/tmp' }, // local — excluded from count
        ],
      });
      await runUpdate([]);
      // 2 remote sources, 0 errors → updated = 2
      expect(logSpy.mock.calls[0][0]).toMatch(/\(2 remote/);
    });

    it('prints warnings to stderr when sources fail', async () => {
      fetchAllRegistries.mockResolvedValue([
        { source: 'community', error: 'network unreachable' },
      ]);
      await runUpdate([]);
      const stderrText = stderrSpy.mock.calls.map((c) => c[0]).join('');
      expect(stderrText).toMatch(/community/);
      expect(stderrText).toMatch(/network unreachable/);
    });

    it('subtracts errors from the updated count', async () => {
      fetchAllRegistries.mockResolvedValue([
        { source: 'community', error: 'fail' },
      ]);
      await runUpdate([]);
      // 2 remote, 1 error → updated = 1
      expect(logSpy.mock.calls[0][0]).toMatch(/\(1 remote/);
    });

    it('does NOT call fetchFullBundle in default mode', async () => {
      await runUpdate([]);
      expect(fetchFullBundle).not.toHaveBeenCalled();
    });
  });

  describe('--full mode', () => {
    it('calls fetchFullBundle for each remote source', async () => {
      loadConfig.mockReturnValue({
        sources: [
          { name: 'maintainer' },
          { name: 'community' },
          { name: 'local', path: '/tmp' },
        ],
      });
      fetchFullBundle.mockResolvedValue(undefined);
      await runUpdate(['--full']);
      expect(fetchFullBundle).toHaveBeenCalledTimes(2);
      expect(fetchFullBundle).toHaveBeenCalledWith('maintainer');
      expect(fetchFullBundle).toHaveBeenCalledWith('community');
    });

    it('skips local sources with an info() message', async () => {
      loadConfig.mockReturnValue({ sources: [{ name: 'local', path: '/tmp' }] });
      await runUpdate(['--full']);
      expect(fetchFullBundle).not.toHaveBeenCalled();
      expect(info).toHaveBeenCalledWith(expect.stringMatching(/Skipping local source/));
    });

    it('reports success after downloading', async () => {
      fetchFullBundle.mockResolvedValue(undefined);
      await runUpdate(['--full']);
      expect(logSpy.mock.calls[0][0]).toMatch(/Full bundle/);
    });

    it('does NOT call fetchAllRegistries in --full mode', async () => {
      fetchFullBundle.mockResolvedValue(undefined);
      await runUpdate(['--full']);
      expect(fetchAllRegistries).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('exits 1 when fetchAllRegistries throws', async () => {
      fetchAllRegistries.mockRejectedValue(new Error('connection refused'));
      let exitCode = null;
      try {
        await runUpdate([]);
      } catch (err) {
        exitCode = String(err.message);
      }
      expect(exitCode).toBe('__exit__:1');
      expect(errSpy.mock.calls[0][0]).toMatch(/connection refused/);
    });

    it('exits 1 when fetchFullBundle throws in --full mode', async () => {
      fetchFullBundle.mockRejectedValue(new Error('bundle missing'));
      let exitCode = null;
      try {
        await runUpdate(['--full']);
      } catch (err) {
        exitCode = String(err.message);
      }
      expect(exitCode).toBe('__exit__:1');
    });
  });

  describe('--json mode', () => {
    it('passes the result through output() with json:true', async () => {
      await runUpdate([], ['--json']);
      expect(output).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ok', mode: 'registry' }),
        expect.any(Function),
        expect.objectContaining({ json: true }),
      );
    });

    it('reports mode:full in --json --full', async () => {
      fetchFullBundle.mockResolvedValue(undefined);
      await runUpdate(['--full'], ['--json']);
      expect(output).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'full' }),
        expect.any(Function),
        expect.anything(),
      );
    });
  });
});
