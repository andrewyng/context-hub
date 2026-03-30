import chalk from 'chalk';
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
import { trackEvent, shutdownAnalytics, setCliVersion } from './lib/analytics.js';
import { error } from './lib/output.js';
import { showWelcomeIfNeeded } from './lib/welcome.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
setCliVersion(pkg.version);

function printUsage() {
  console.log(`
${chalk.bold('chub')} — Context Hub CLI v${pkg.version}
Search and retrieve LLM-optimized docs and skills.

${chalk.bold.underline('Getting Started')}

  ${chalk.dim('$')} chub update                                ${chalk.dim('# download the registry')}
  ${chalk.dim('$')} chub search                                ${chalk.dim('# list everything available')}
  ${chalk.dim('$')} chub search "stripe"                       ${chalk.dim('# fuzzy search')}
  ${chalk.dim('$')} chub search stripe/payments                ${chalk.dim('# exact id → full detail')}
  ${chalk.dim('$')} chub get stripe/api                        ${chalk.dim('# print doc to terminal')}
  ${chalk.dim('$')} chub get stripe/api -o doc.md              ${chalk.dim('# save to file')}
  ${chalk.dim('$')} chub get openai/chat --lang py             ${chalk.dim('# specific language')}
  ${chalk.dim('$')} chub get pw-community/login-flows          ${chalk.dim('# fetch a skill')}
  ${chalk.dim('$')} chub get openai/chat stripe/api            ${chalk.dim('# fetch multiple')}

${chalk.bold.underline('Learn & Improve')}

  After using a doc, save what you learned so future sessions start smarter:

  ${chalk.dim('$')} chub annotate stripe/api "Webhook needs raw body"   ${chalk.dim('# persists across sessions')}
  ${chalk.dim('$')} chub annotate --list                                 ${chalk.dim('# see all saved notes')}
  ${chalk.dim('$')} chub annotate stripe/api --clear                     ${chalk.dim('# remove a note')}

  Always rate docs after using them — helps authors fix issues and prioritize:

  ${chalk.dim('$')} chub feedback stripe/api up --label accurate "Clear examples"
  ${chalk.dim('$')} chub feedback stripe/api down --label outdated "Missing v3 API"

${chalk.bold.underline('Commands')}

  ${chalk.bold('search')} [query]              Search docs and skills (no query = list all)
  ${chalk.bold('get')} <ids...>                 Fetch docs or skills by ID
  ${chalk.bold('annotate')} [id] [note]        Save a note — appears on future fetches
  ${chalk.bold('feedback')} <id> <up|down>     Rate a doc (helps authors improve it)
  ${chalk.bold('update')}                      Refresh the cached registry
  ${chalk.bold('cache')} status|clear          Manage the local cache
  ${chalk.bold('build')} <content-dir>        Build registry from content directory

${chalk.bold.underline('Flags')}

  --json                 Structured JSON output (for agents and piping)
  --tags <csv>           Filter by tags (e.g. docs, skill, openai, browser)
  --lang <language>      Language variant (required for docs): py | js | ts | rb | cs | pwsh (or full name)
  --full                 Fetch all files, not just the entry point
  -o, --output <path>    Write content to file or directory

${chalk.bold.underline('Agent Piping Patterns')}

  ${chalk.dim('# Get the top result id')}
  ${chalk.dim('$')} chub search "stripe" --json | jq -r '.results[0].id'

  ${chalk.dim('# Search → pick → fetch → save')}
  ${chalk.dim('$')} ID=$(chub search "stripe" --json | jq -r '.results[0].id')
  ${chalk.dim('$')} chub get "$ID" --lang js -o .context/stripe.md

  ${chalk.dim('# Fetch multiple at once')}
  ${chalk.dim('$')} chub get openai/chat stripe/api -o .context/

${chalk.bold.underline('Multi-Source Config')} ${chalk.dim('(~/.chub/config.yaml)')}

  ${chalk.dim('sources:')}
  ${chalk.dim('  - name: community')}
  ${chalk.dim('    url: https://cdn.aichub.org/v1')}
  ${chalk.dim('  - name: internal')}
  ${chalk.dim('    path: /path/to/local/docs')}

  ${chalk.dim('# On id collision, use source: prefix: chub get internal:openai/chat')}
`);
}

const program = new Command();

program
  .name('chub')
  .description('Context Hub - search and retrieve LLM-optimized docs and skills')
  .version(pkg.version, '-V, --cli-version')
  .option('--json', 'Output as JSON (machine-readable)')
  .action(() => {
    printUsage();
  });

// Commands that don't need registry
const SKIP_REGISTRY = ['update', 'cache', 'build', 'feedback', 'annotate', 'help'];

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

program.parse();

// Flush analytics before exit (best-effort)
process.on('beforeExit', () => shutdownAnalytics().catch(() => {}));
