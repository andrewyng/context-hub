import chalk from 'chalk';
import { fetchAllRegistries, fetchFullBundle } from '../lib/cache.js';
import { loadConfig } from '../lib/config.js';
import { output, info } from '../lib/output.js';

export function registerUpdateCommand(program) {
  program
    .command('update')
    .description('Refresh the cached registry index')
    .option('--force', 'Force re-download even if cache is fresh')
    .option('--full', 'Download the full bundle for offline use')
    .action(async (opts) => {
      const globalOpts = program.optsWithGlobals();
      const config = loadConfig();

      try {
        if (opts.full) {
          // Download full bundle for each remote source
          for (const source of config.sources) {
            if (source.path) {
              info(`Skipping local source: ${source.name}`);
              continue;
            }
            info(`Downloading full bundle for ${source.name}...`);
            await fetchFullBundle(source.name);
          }
          output(
            { status: 'ok', mode: 'full' },
            () => console.log(chalk.green('Full bundle(s) downloaded and extracted.')),
            globalOpts
          );
        } else {
          info('Updating registries...');
          const errors = await fetchAllRegistries(opts.force);
          if (errors.length > 0) {
            for (const e of errors) {
              process.stderr.write(chalk.yellow(`Warning: ${e.source}: ${e.error}\n`));
            }
          }
          const updated = config.sources.filter((s) => !s.path).length - errors.length;
          output(
            { status: 'ok', mode: 'registry', updated, errors },
            () => console.log(chalk.green(`Registry updated (${updated} remote source(s)).`)),
            globalOpts
          );
        }
      } catch (err) {
        output(
          { error: err.message },
          () => console.error(chalk.red(`Update failed: ${err.message}`)),
          globalOpts
        );
        process.exit(1);
      }
    });
}
