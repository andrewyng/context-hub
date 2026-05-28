import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { output, info, error } from '../../src/lib/output.js';

describe('output', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('writes pretty-printed JSON to stdout in JSON mode', () => {
    const data = { foo: 'bar', n: 1 };
    const formatter = vi.fn();
    output(data, formatter, { json: true });
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
  });

  it('does NOT invoke the human formatter in JSON mode', () => {
    const formatter = vi.fn();
    output({ foo: 'bar' }, formatter, { json: true });
    expect(formatter).not.toHaveBeenCalled();
  });

  it('invokes the formatter with the data in human mode (opts.json falsy)', () => {
    const data = { foo: 'bar' };
    const formatter = vi.fn();
    output(data, formatter, { json: false });
    expect(formatter).toHaveBeenCalledWith(data);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('invokes the formatter when opts is an empty object', () => {
    const data = { hello: 'world' };
    const formatter = vi.fn();
    output(data, formatter, {});
    expect(formatter).toHaveBeenCalledWith(data);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('treats undefined opts as human mode (does not throw on opts?.json)', () => {
    const data = { hello: 'world' };
    const formatter = vi.fn();
    expect(() => output(data, formatter, undefined)).not.toThrow();
    expect(formatter).toHaveBeenCalledWith(data);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('treats null opts as human mode (does not throw on opts?.json)', () => {
    const data = { hello: 'world' };
    const formatter = vi.fn();
    expect(() => output(data, formatter, null)).not.toThrow();
    expect(formatter).toHaveBeenCalledWith(data);
    expect(logSpy).not.toHaveBeenCalled();
  });
});

describe('info', () => {
  let stderrSpy;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it('writes the message followed by a newline to stderr', () => {
    info('hello world');
    expect(stderrSpy).toHaveBeenCalledWith('hello world\n');
  });

  it('writes an empty message as just a newline', () => {
    info('');
    expect(stderrSpy).toHaveBeenCalledWith('\n');
  });
});

describe('error', () => {
  let logSpy;
  let stderrSpy;
  let exitSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    stderrSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('writes JSON error to stdout in JSON mode', () => {
    error('something went wrong', { json: true });
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ error: 'something went wrong' }));
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('calls process.exit(1) in JSON mode', () => {
    error('boom', { json: true });
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('writes "Error: <msg>\\n" to stderr in human mode', () => {
    error('something went wrong', { json: false });
    expect(stderrSpy).toHaveBeenCalledWith('Error: something went wrong\n');
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('calls process.exit(1) in human mode', () => {
    error('boom', { json: false });
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('treats undefined opts as human mode and still exits with 1', () => {
    error('no opts here');
    expect(stderrSpy).toHaveBeenCalledWith('Error: no opts here\n');
    expect(logSpy).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('treats null opts as human mode and still exits with 1', () => {
    error('null opts', null);
    expect(stderrSpy).toHaveBeenCalledWith('Error: null opts\n');
    expect(logSpy).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('treats empty opts object as human mode', () => {
    error('empty opts', {});
    expect(stderrSpy).toHaveBeenCalledWith('Error: empty opts\n');
    expect(logSpy).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
