import chalk from 'chalk';
import { getCacheStats, clearCache } from '../lib/cache.js';
import { output } from '../lib/output.js';

export function registerCacheCommand(program) {
  const cache = program
    .command('cache')
    .description('Manage the local cache');

  cache
    .command('status')
    .description('Show cache information')
    .action(() => {
      const globalOpts = program.optsWithGlobals();
      const stats = getCacheStats();

      output(stats, (s) => {
        if (!s.exists || s.sources.length === 0) {
          console.log(chalk.yellow('No cache found. Run `chub update` to initialize.'));
          return;
        }
        console.log(chalk.bold('Cache Status\n'));
        for (const src of s.sources) {
          if (src.type === 'local') {
            console.log(`  ${chalk.bold(src.name)} ${chalk.dim('(local)')}`);
            console.log(`    Path: ${src.path}`);
          } else {
            console.log(`  ${chalk.bold(src.name)} ${chalk.dim('(remote)')}`);
            console.log(`    Registry: ${src.hasRegistry ? chalk.green('yes') : chalk.red('no')}`);
            console.log(`    Last updated: ${src.lastUpdated || 'never'}`);
            console.log(`    Full bundle: ${src.fullBundle ? 'yes' : 'no'}`);
            console.log(`    Cached files: ${src.fileCount}`);
            console.log(`    Size: ${(src.dataSize / 1024).toFixed(1)} KB`);
          }
        }
      }, globalOpts);
    });

  cache
    .command('clear')
    .description('Clear cached data')
    .action((opts) => {
      const globalOpts = program.optsWithGlobals();
      clearCache();
      output(
        { status: 'cleared' },
        () => console.log(chalk.green('Cache cleared.')),
        globalOpts
      );
    });
}
