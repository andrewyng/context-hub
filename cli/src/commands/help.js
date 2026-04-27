import chalk from 'chalk';
import { loadHelpContent } from '../lib/help.js';
import { output } from '../lib/output.js';

export function printHelpContent(data) {
  if (data.source === 'remote') {
    const details = [`version ${data.resolvedVersion || data.requestedVersion}`];
    if (data.helpRevision) details.push(`revision ${data.helpRevision}`);
    if (data.updatedAt) details.push(`updated ${data.updatedAt}`);
    console.log(chalk.dim(`Help source: remote (${details.join(', ')})`));
  } else if (data.url) {
    console.log(chalk.dim(`Help source: local fallback (${data.fallbackReason || 'remote unavailable'})`));
  } else {
    console.log(chalk.dim('Help source: local'));
  }

  process.stdout.write(`${data.content}\n`);
}

export function registerHelpCommand(program, cliVersion) {
  program
    .command('help')
    .description('Show the same versioned chub bootstrap guidance as chub --help')
    .allowExcessArguments(false)
    .action(async () => {
      const globalOpts = program.optsWithGlobals();
      const help = await loadHelpContent(cliVersion);
      output(help, printHelpContent, globalOpts);
    });
}
