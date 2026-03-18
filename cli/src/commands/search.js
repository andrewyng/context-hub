import chalk from 'chalk';
import { searchEntries, listEntries, getEntry, getDisplayId, isMultiSource } from '../lib/registry.js';
import { displayLanguage } from '../lib/normalize.js';
import { output } from '../lib/output.js';
import { trackEvent } from '../lib/analytics.js';

function formatEntryList(entries) {
  const multi = isMultiSource();
  for (const entry of entries) {
    const id = getDisplayId(entry);
    const source = entry.source ? chalk.dim(`[${entry.source}]`) : '';
    const sourceName = multi ? chalk.cyan(`(${entry._source})`) : '';
    const type = entry._type === 'skill' ? chalk.magenta('[skill]') : chalk.blue('[doc]');
    const langs = (entry.languages || []).map((l) => displayLanguage(l.language)).join(', ');
    const desc = entry.description
      ? entry.description.length > 60
        ? entry.description.slice(0, 57) + '...'
        : entry.description
      : '';
    console.log(`  ${chalk.bold(id)}  ${type}  ${chalk.dim(langs)}  ${source} ${sourceName}`.trimEnd());
    if (desc) console.log(`       ${chalk.dim(desc)}`);
  }
}

function formatEntryDetail(entry) {
  console.log(chalk.bold(entry.name));
  if (isMultiSource()) console.log(`  Source: ${entry._source}`);
  if (entry.source) console.log(`  Quality: ${entry.source}`);
  if (entry.description) console.log(`  ${chalk.dim(entry.description)}`);
  if (entry.tags?.length) console.log(`  Tags: ${entry.tags.join(', ')}`);
  console.log();
  if (entry.languages) {
    for (const lang of entry.languages) {
      console.log(`  ${chalk.bold(displayLanguage(lang.language))}`);
      console.log(`    Recommended: ${lang.recommendedVersion}`);
      for (const v of lang.versions || []) {
        const size = v.size ? ` (${(v.size / 1024).toFixed(1)} KB)` : '';
        console.log(`    ${v.version}${size}  updated: ${v.lastUpdated}`);
      }
    }
  } else {
    // Skill — flat structure
    const size = entry.size ? ` (${(entry.size / 1024).toFixed(1)} KB)` : '';
    console.log(`  Path: ${entry.path}${size}`);
    if (entry.lastUpdated) console.log(`  Updated: ${entry.lastUpdated}`);
    if (entry.files?.length) console.log(`  Files: ${entry.files.join(', ')}`);
  }
}

export function registerSearchCommand(program) {
  program
    .command('search [query]')
    .description('Search docs and skills (no query lists all)')
    .option('--tags <tags>', 'Filter by tags (comma-separated)')
    .option('--lang <language>', 'Filter by language')
    .option('--limit <n>', 'Max results', '20')
    .action((query, opts) => {
      const globalOpts = program.optsWithGlobals();
      const limit = parseInt(opts.limit, 10) || 20;

      // No query: list all
      if (!query) {
        const entries = listEntries(opts).slice(0, limit);
        output({ results: entries, total: entries.length }, (data) => {
          if (data.results.length === 0) {
            console.log(chalk.yellow('No entries found.'));
            return;
          }
          console.log(chalk.bold(`${data.total} entries:\n`));
          formatEntryList(data.results);
        }, globalOpts);
        return;
      }

      // Exact id match: show detail
      const result = getEntry(query);
      if (result.ambiguous) {
        output(
          { error: 'ambiguous', alternatives: result.alternatives },
          () => {
            console.log(chalk.yellow(`Multiple entries with id "${query}". Be specific:`));
            for (const alt of result.alternatives) {
              console.log(`  ${chalk.bold(alt)}`);
            }
          },
          globalOpts
        );
        return;
      }
      if (result.entry) {
        output(result.entry, formatEntryDetail, globalOpts);
        return;
      }

      // Fuzzy search
      const results = searchEntries(query, opts).slice(0, limit);
      trackEvent('search', {
        query_length: query.length,
        result_count: results.length,
        has_tags: !!opts.tags,
        has_lang: !!opts.lang,
      }).catch(() => {});
      output({ results, total: results.length, query }, (data) => {
        if (data.results.length === 0) {
          console.log(chalk.yellow(`No results for "${query}".`));
          return;
        }
        console.log(chalk.bold(`${data.total} results for "${query}":\n`));
        formatEntryList(data.results);
      }, globalOpts);
    });
}
