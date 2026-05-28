import { describe, it, expect } from 'vitest';
import { rewriteRemovedCommand } from '../../src/lib/removed-commands.js';

function argv(...args) {
  return ['/usr/bin/node', '/path/to/chub', ...args];
}

describe('rewriteRemovedCommand', () => {
  it('rewrites `list` to `search` and returns deprecation message', () => {
    const result = rewriteRemovedCommand(argv('list'));
    expect(result).not.toBeNull();
    expect(result.rewritten.slice(2)).toEqual(['search']);
    expect(result.message).toMatch(/`chub list` was removed/);
    expect(result.message).toMatch(/`chub search`/);
  });

  it('preserves trailing flags after the rewritten command', () => {
    const result = rewriteRemovedCommand(argv('list', '--limit', '5'));
    expect(result.rewritten.slice(2)).toEqual(['search', '--limit', '5']);
  });

  it('preserves --tags and --lang flags', () => {
    const result = rewriteRemovedCommand(argv('list', '--tags', 'ai', '--lang', 'python'));
    expect(result.rewritten.slice(2)).toEqual(['search', '--tags', 'ai', '--lang', 'python']);
  });

  it('skips the root --json flag when locating the positional', () => {
    const result = rewriteRemovedCommand(argv('--json', 'list'));
    expect(result.rewritten.slice(2)).toEqual(['--json', 'search']);
  });

  it('returns null for non-removed commands', () => {
    expect(rewriteRemovedCommand(argv('search'))).toBeNull();
    expect(rewriteRemovedCommand(argv('get', 'openai/chat'))).toBeNull();
  });

  it('returns null when no positional argument is present', () => {
    expect(rewriteRemovedCommand(argv())).toBeNull();
    expect(rewriteRemovedCommand(argv('--json'))).toBeNull();
    expect(rewriteRemovedCommand(argv('--help'))).toBeNull();
  });

  it('does not rewrite when `list` appears as a value to a different command', () => {
    // `chub search list` is a legitimate fuzzy query, not a removed command
    expect(rewriteRemovedCommand(argv('search', 'list'))).toBeNull();
  });
});
