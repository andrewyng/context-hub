import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getEntry } from '../lib/registry.js';
import { sendFeedback, isFeedbackEnabled, isTelemetryEnabled, getTelemetryUrl } from '../lib/telemetry.js';
import { getOrCreateClientId } from '../lib/identity.js';
import { output, error } from '../lib/output.js';
import { trackEvent } from '../lib/analytics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VALID_LABELS = [
  'accurate', 'well-structured', 'helpful', 'good-examples',
  'outdated', 'inaccurate', 'incomplete', 'wrong-examples',
  'wrong-version', 'poorly-structured',
];

function collect(val, acc) {
  acc.push(val);
  return acc;
}

export function registerFeedbackCommand(program) {
  program
    .command('feedback [id] [rating] [comment]')
    .description('Rate a doc or skill (up/down)')
    .option('--type <type>', 'Explicit type: doc or skill')
    .option('--lang <language>', 'Language variant of the doc')
    .option('--doc-version <version>', 'Version of the doc')
    .option('--file <file>', 'Specific file within the entry (e.g. references/streaming.md)')
    .option('--label <label>', 'Feedback label (repeatable: --label outdated --label wrong-examples)', collect, [])
    .option('--agent <name>', 'AI coding tool name')
    .option('--model <model>', 'LLM model name')
    .option('--status', 'Show feedback and telemetry status')
    .action(async (id, rating, comment, opts) => {
      const globalOpts = program.optsWithGlobals();

      // --status flag
      if (opts.status) {
        const feedbackEnabled = isFeedbackEnabled();
        const telemetryEnabled = isTelemetryEnabled();
        if (globalOpts.json) {
          let clientId = null;
          try { clientId = await getOrCreateClientId(); } catch {}
          console.log(JSON.stringify({
            feedback: feedbackEnabled,
            telemetry: telemetryEnabled,
            client_id_prefix: clientId ? clientId.slice(0, 8) : null,
            endpoint: getTelemetryUrl(),
            valid_labels: VALID_LABELS,
          }));
        } else {
          console.log(`Feedback:  ${feedbackEnabled ? chalk.green('enabled') : chalk.red('disabled')}`);
          console.log(`Telemetry: ${telemetryEnabled ? chalk.green('enabled') : chalk.red('disabled')}`);
          try {
            const cid = await getOrCreateClientId();
            console.log(`Client ID: ${cid.slice(0, 8)}...`);
          } catch {}
          console.log(`Endpoint:  ${getTelemetryUrl()}`);
          console.log(`Labels:    ${VALID_LABELS.join(', ')}`);
        }
        return;
      }

      // BUG #1 FIX: Validation errors respect --json flag
      if (!id || !rating) {
        error('Missing required arguments: <id> and <rating>. Run: chub feedback <id> <up|down> [comment]', globalOpts);
      }

      if (rating !== 'up' && rating !== 'down') {
        error('Rating must be "up" or "down".', globalOpts);
      }

      if (!isFeedbackEnabled()) {
        output(
          { status: 'skipped', reason: 'feedback_disabled' },
          () => console.log(chalk.yellow('Feedback is disabled. Enable with: feedback: true in ~/.chub/config.yaml')),
          globalOpts
        );
        return;
      }

      // BUG #2 FIX: Only auto-detect type if --type not explicitly set
      let entryType = opts.type || null;
      let docLang = opts.lang || undefined;
      let docVersion = opts.docVersion || undefined;
      let source;
      try {
        const result = getEntry(id);
        if (result.entry) {
          if (!entryType) {
            entryType = result.entry.languages ? 'doc' : 'skill';
          }
          source = result.entry._source;

          // If doc and user didn't specify lang/version, try to infer from entry
          if (result.entry.languages && !docLang && result.entry.languages.length === 1) {
            docLang = result.entry.languages[0].language;
          }
          if (result.entry.languages && !docVersion) {
            const lang = result.entry.languages.find((l) => l.language === docLang) || result.entry.languages[0];
            if (lang) docVersion = lang.recommendedVersion;
          }
        }
      } catch {
        // Registry not loaded — use explicit flags
      }
      if (!entryType) entryType = 'doc'; // Final fallback

      // Parse labels (--label is repeatable, collected into an array)
      let labels;
      if (opts.label && opts.label.length > 0) {
        labels = opts.label.map((l) => l.trim().toLowerCase()).filter((l) => VALID_LABELS.includes(l));
        if (labels.length === 0) labels = undefined;
      }

      // Read CLI version
      let cliVersion;
      try {
        const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));
        cliVersion = pkg.version;
      } catch {}

      const result = await sendFeedback(id, entryType, rating, {
        comment,
        docLang,
        docVersion,
        targetFile: opts.file,
        labels,
        agent: opts.agent,
        model: opts.model,
        cliVersion,
        source,
      });

      if (result.status === 'sent') {
        trackEvent('feedback_sent', { entry_id: id, rating, entry_type: entryType }).catch(() => {});
      }

      output(result, (data) => {
        if (data.status === 'sent') {
          const parts = [chalk.green(`Feedback recorded for ${id}`)];
          if (docLang) parts.push(chalk.dim(`lang=${docLang}`));
          if (docVersion) parts.push(chalk.dim(`version=${docVersion}`));
          if (opts.file) parts.push(chalk.dim(`file=${opts.file}`));
          console.log(parts.join(' '));
        } else if (data.status === 'error') {
          process.stderr.write(chalk.red(`Failed to send feedback: ${data.reason || `HTTP ${data.code}`}\n`));
        }
      }, globalOpts);
    });
}
