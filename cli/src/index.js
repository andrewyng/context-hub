import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ensureRegistry } from './lib/cache.js';
import { registerUpdateCommand } from './commands/update.js';
import { registerCacheCommand } from './commands/cache.js';
import { registerSearchCommand } from './commands/search.js';
import { registerGetCommand } from './commands/get.js';
import { registerBuildCommand } from './commands/build.js';
import { registerFeedbackCommand } from './commands/feedback.js';
import { registerAnnotateCommand } from './commands/annotate.js';
import { printHelpContent } from './commands/help.js';
import { trackEvent, shutdownAnalytics, setCliVersion } from './lib/analytics.js';
import { error, output } from './lib/output.js';
import { showWelcomeIfNeeded } from './lib/welcome.js';
import { loadHelpContent } from './lib/help.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
setCliVersion(pkg.version);

const program = new Command();

function isRootHelpRequest(argv) {
  const args = argv.slice(2);
  const hasHelpFlag = args.includes('--help') || args.includes('-h');
  if (!hasHelpFlag) return false;

  // Preserve subcommand help, e.g. `chub search --help`.
  return args.every((arg) => arg.startsWith('-'));
}

function isRootHelpAlias(argv) {
  const args = argv.slice(2);
  return args[0] === 'help' && args.slice(1).every((arg) => arg.startsWith('-'));
}

function getHelpAliasOperands(argv) {
  const args = argv.slice(2);
  if (args[0] !== 'help') return [];
  return args.slice(1).filter((arg) => !arg.startsWith('-'));
}

async function printRootHelp() {
  const help = await loadHelpContent(pkg.version);
  output(help, printHelpContent, {});
}

program
  .name('chub')
  .description('Context Hub - search and retrieve LLM-optimized docs and skills')
  .version(pkg.version, '-V, --cli-version')
  .addHelpCommand(false)
  .option('--json', 'Output as JSON (machine-readable)')
  .allowExcessArguments(false)
  .action(async () => {
    await printRootHelp();
  });

// Commands that don't need registry
const SKIP_REGISTRY = ['update', 'cache', 'build', 'feedback', 'annotate'];

program.hook('preAction', async (thisCommand) => {
  const globalOpts = thisCommand.optsWithGlobals?.() || {};
  showWelcomeIfNeeded(globalOpts);

  const cmdName = thisCommand.args?.[0] || thisCommand.name();
  if (cmdName !== 'chub') {
    // Only initialize identity and track if telemetry is enabled
    // Respects CHUB_TELEMETRY=0 — no client_id file created, no events sent
    try {
      const { isTelemetryEnabled } = await import('./lib/telemetry.js');
      if (isTelemetryEnabled()) {
        const { getOrCreateClientId, isFirstRun } = await import('./lib/identity.js');
        await getOrCreateClientId();

        // Fire-and-forget — don't block command on PostHog network I/O
        trackEvent('command_run', { command: cmdName }).catch(() => {});
        if (isFirstRun()) {
          trackEvent('first_run', { command: cmdName }).catch(() => {});
        }
      }
    } catch {
      // Identity/telemetry failure — silently skip, don't block the command
    }
  }
  if (SKIP_REGISTRY.includes(cmdName)) return;
  if (thisCommand.parent?.name() === 'cache') return;
  // Don't fetch registry for default action (no command)
  if (cmdName === 'chub') return;
  try {
    await ensureRegistry();
  } catch (err) {
    await trackEvent('command_error', { command: cmdName, error_type: 'registry_unavailable' });
    error(`Registry not available: ${err.message}. Run \`chub update\` to refresh remote registries, or check that local source paths in ~/.chub/config.yaml are correct.`, globalOpts);
  }
});

registerUpdateCommand(program);
registerCacheCommand(program);
registerSearchCommand(program);
registerGetCommand(program);
registerBuildCommand(program);
registerFeedbackCommand(program);
registerAnnotateCommand(program);

const helpAliasOperands = getHelpAliasOperands(process.argv);
if (helpAliasOperands.length > 0) {
  error(
    `Unexpected operand for help: "${helpAliasOperands.join(' ')}". Use \`chub <command> --help\` for command syntax help.`,
    {}
  );
} else if (isRootHelpAlias(process.argv) || isRootHelpRequest(process.argv)) {
  await printRootHelp();
} else {
  program.parse();
}

// Flush analytics before exit (best-effort)
process.on('beforeExit', () => shutdownAnalytics().catch(() => {}));
