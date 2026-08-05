import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

vi.mock('../../src/lib/annotations.js', () => ({
  readAnnotation: vi.fn(),
  writeAnnotation: vi.fn(),
  clearAnnotation: vi.fn(),
  listAnnotations: vi.fn(),
}));
vi.mock('../../src/lib/output.js', () => ({
  output: vi.fn((data, formatter, opts) => {
    if (opts?.json) console.log(JSON.stringify(data));
    else formatter(data);
  }),
  error: vi.fn((msg) => {
    throw new Error(`__exit__:${msg}`);
  }),
  info: vi.fn(),
}));

const { readAnnotation, writeAnnotation, clearAnnotation, listAnnotations } =
  await import('../../src/lib/annotations.js');
const { output, error } = await import('../../src/lib/output.js');
const { registerAnnotateCommand } = await import('../../src/commands/annotate.js');

async function runAnnotate(args = [], globalArgs = []) {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'JSON output');
  registerAnnotateCommand(program);
  try {
    await program.parseAsync(['node', 'test', ...globalArgs, 'annotate', ...args]);
  } catch (err) {
    if (!String(err.message).startsWith('__exit__:')) throw err;
  }
}

describe('annotate command', () => {
  let logSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe('--list mode', () => {
    it('prints "No annotations." when empty', async () => {
      listAnnotations.mockReturnValue([]);
      await runAnnotate(['--list']);
      expect(logSpy).toHaveBeenCalledWith('No annotations.');
    });

    it('prints each annotation when present', async () => {
      listAnnotations.mockReturnValue([
        { id: 'acme/widgets', note: 'careful', updatedAt: '2026-01-01' },
        { id: 'openai/chat', note: 'cached', updatedAt: '2026-02-02' },
      ]);
      await runAnnotate(['--list']);
      const calls = logSpy.mock.calls.map((c) => c[0]).join('\n');
      expect(calls).toMatch(/acme\/widgets/);
      expect(calls).toMatch(/openai\/chat/);
      expect(calls).toMatch(/careful/);
      expect(calls).toMatch(/cached/);
    });

    it('respects --json by passing through output()', async () => {
      listAnnotations.mockReturnValue([{ id: 'x', note: 'y', updatedAt: 'z' }]);
      await runAnnotate(['--list'], ['--json']);
      expect(output).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({ json: true }),
      );
    });
  });

  describe('missing id without --list', () => {
    it('calls error() with usage hint', async () => {
      await runAnnotate([]);
      expect(error).toHaveBeenCalled();
      expect(error.mock.calls[0][0]).toMatch(/Missing required argument/);
      expect(error.mock.calls[0][0]).toMatch(/--list/);
    });
  });

  describe('--clear mode', () => {
    it('reports success when annotation existed', async () => {
      clearAnnotation.mockReturnValue(true);
      await runAnnotate(['acme/widgets', '--clear']);
      expect(clearAnnotation).toHaveBeenCalledWith('acme/widgets');
      expect(logSpy.mock.calls[0][0]).toMatch(/cleared/);
    });

    it('reports "no annotation" when nothing to clear', async () => {
      clearAnnotation.mockReturnValue(false);
      await runAnnotate(['acme/widgets', '--clear']);
      expect(logSpy.mock.calls[0][0]).toMatch(/No annotation found/);
    });

    it('passes the cleared flag through to output()', async () => {
      clearAnnotation.mockReturnValue(true);
      await runAnnotate(['acme/widgets', '--clear']);
      expect(output).toHaveBeenCalledWith(
        { id: 'acme/widgets', cleared: true },
        expect.any(Function),
        expect.anything(),
      );
    });
  });

  describe('read mode (id without note)', () => {
    it('prints the existing annotation when present', async () => {
      readAnnotation.mockReturnValue({
        id: 'acme/widgets',
        note: 'the note',
        updatedAt: '2026-01-01',
      });
      await runAnnotate(['acme/widgets']);
      expect(readAnnotation).toHaveBeenCalledWith('acme/widgets');
      const calls = logSpy.mock.calls.map((c) => c[0]).join('\n');
      expect(calls).toMatch(/the note/);
      expect(calls).toMatch(/acme\/widgets/);
    });

    it('reports no-annotation when absent', async () => {
      readAnnotation.mockReturnValue(null);
      await runAnnotate(['acme/widgets']);
      expect(logSpy.mock.calls[0][0]).toMatch(/No annotation for/);
    });

    it('does not call writeAnnotation in read mode', async () => {
      readAnnotation.mockReturnValue(null);
      await runAnnotate(['acme/widgets']);
      expect(writeAnnotation).not.toHaveBeenCalled();
    });
  });

  describe('write mode (id + note)', () => {
    it('writes the annotation and reports success', async () => {
      writeAnnotation.mockReturnValue({
        id: 'acme/widgets',
        note: 'remember this',
        updatedAt: '2026-01-01',
      });
      await runAnnotate(['acme/widgets', 'remember this']);
      expect(writeAnnotation).toHaveBeenCalledWith('acme/widgets', 'remember this');
      expect(logSpy.mock.calls[0][0]).toMatch(/Annotation saved/);
    });

    it('does not call readAnnotation when a note is provided', async () => {
      writeAnnotation.mockReturnValue({ id: 'x', note: 'y', updatedAt: 'z' });
      await runAnnotate(['acme/widgets', 'a note']);
      expect(readAnnotation).not.toHaveBeenCalled();
    });
  });
});
