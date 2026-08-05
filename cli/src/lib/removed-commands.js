// Commands removed in 0.1.4 and their replacement form.
// `chub list` was folded into `chub search` (no query lists all). A
// transparent alias keeps existing scripts and agent muscle memory working,
// with a one-line deprecation notice so users know to update.
export const REMOVED_COMMANDS = {
  list: {
    replacement: 'search',
    message:
      '`chub list` was removed in 0.1.4 — use `chub search` (no query lists all). Forwarding to `chub search`.',
  },
};

// Boolean flags on the root command that don't take a value.
const ROOT_BOOLEAN_FLAGS = new Set([
  '--json',
  '--help',
  '-h',
  '--version',
  '-v',
  '-V',
  '--cli-version',
]);

// Find the first non-flag arg, skipping root-level option values. Mirrors how
// Commander would treat the first positional as a subcommand name.
function findFirstPositionalIndex(args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('-')) return i;
    if (arg.includes('=')) continue;
    if (ROOT_BOOLEAN_FLAGS.has(arg)) continue;
    i++;
  }
  return -1;
}

export function rewriteRemovedCommand(argv) {
  const args = argv.slice(2);
  const idx = findFirstPositionalIndex(args);
  if (idx === -1) return null;
  const removed = REMOVED_COMMANDS[args[idx]];
  if (!removed) return null;
  const rewritten = [...args];
  rewritten[idx] = removed.replacement;
  return { rewritten: [argv[0], argv[1], ...rewritten], message: removed.message };
}
