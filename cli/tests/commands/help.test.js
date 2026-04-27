import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/lib/help.js', () => ({
  loadHelpContent: vi.fn(async () => ({
    source: 'remote',
    content: 'Remote help body',
    requestedVersion: '0.1.3',
    resolvedVersion: '0.1.3',
    helpRevision: '2026-04-01.1',
    resolution: 'exact',
  })),
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

const { loadHelpContent } = await import('../../src/lib/help.js');
const { output } = await import('../../src/lib/output.js');
const { registerHelpCommand } = await import('../../src/commands/help.js');

async function runHelp(args = [], globalArgs = []) {
  const program = new Command();
  program.exitOverride();
  program.configureOutput({ writeErr: () => {} });
  program.option('--json', 'JSON output');
  registerHelpCommand(program, '0.1.3');
  await program.parseAsync(['node', 'test', ...globalArgs, 'help', ...args]);
}

describe('help command', () => {
  let logSpy;
  let stdoutSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    logSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it('loads help content for the current CLI version', async () => {
    await runHelp();

    expect(loadHelpContent).toHaveBeenCalledWith('0.1.3');
  });

  it('passes JSON mode through output()', async () => {
    await runHelp([], ['--json']);

    expect(output).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'Remote help body' }),
      expect.any(Function),
      expect.objectContaining({ json: true }),
    );
  });

  it('prints the same bootstrap content in human mode', async () => {
    await runHelp();

    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('Remote help body'));
  });

  it('rejects operands so subcommands use their own --help flag', async () => {
    await expect(runHelp(['search'])).rejects.toThrow(/too many arguments/i);

    expect(loadHelpContent).not.toHaveBeenCalled();
  });
});
