import chalk from 'chalk';
import { searchEntries, listEntries, getEntry, getDisplayId, isMultiSource } from '../lib/registry.js';
import { displayLanguage } from '../lib/normalize.js';
import { output } from '../lib/output.js';
import { trackEvent } from '../lib/analytics.js';

function formatSearchSignals(entry, showExplain = false) {
  const score = Number.isFinite(entry._score) ? entry._score.toFixed(1) : '0.0';
  if (!showExplain || !entry._debug) {
    return `score=${score}`;
  }

  const parts = [`score=${score}`];
  if ((entry._debug.baseScore || 0) > 0) {
    parts.push(`${entry._debug.baseKind}=${entry._debug.baseScore.toFixed(1)}`);
  }
  if ((entry._debug.lexicalBoost || 0) > 0) {
    parts.push(`lexical=+${entry._debug.lexicalBoost.toFixed(1)}`);
  }
  if ((entry._debug.coverageBoost || 0) > 0) {
    parts.push(`coverage=+${entry._debug.coverageBoost.toFixed(1)}`);
  }
  if (entry._debug.coverage?.reasons?.length) {
    parts.push(entry._debug.coverage.reasons.join(', '));
  }

  return parts.join(' • ');
}

function formatEntryList(entries, options = {}) {
  const { showScores = false, showExplain = false } = options;
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
    if (showScores || showExplain) {
      console.log(`       ${chalk.dim(formatSearchSignals(entry, showExplain))}`);
    }
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
    .option('--scores', 'Show ranking scores for fuzzy search results')
    .option('--explain', 'Show ranking signals for fuzzy search results')
    .action((query, opts) => {
      const globalOpts = program.optsWithGlobals();
      const limit = parseInt(opts.limit, 10);
      const normalizedQuery = typeof query === 'string' ? query.trim().replace(/\s+/g, ' ') : query;

      // No query: list all
      if (!normalizedQuery) {
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
      const result = getEntry(normalizedQuery);
      if (result.ambiguous) {
        output(
          { error: 'ambiguous', alternatives: result.alternatives },
          () => {
            console.log(chalk.yellow(`Multiple entries with id "${normalizedQuery}". Be specific:`));
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
      const searchStart = Date.now();
      const results = searchEntries(normalizedQuery, opts).slice(0, limit);
      const duration_ms = Date.now() - searchStart;
      const resultIds = results.map((e) => e.id || e.name || 'unknown');
      trackEvent('search', {
        query: normalizedQuery.slice(0, 1000),
        query_length: normalizedQuery.length,
        result_count: results.length,
        results: resultIds,
        duration_ms,
        has_tags: !!opts.tags,
        has_lang: !!opts.lang,
        has_scores: !!opts.scores,
        has_explain: !!opts.explain,
        tags: opts.tags || undefined,
        lang: opts.lang || undefined,
      }).catch(() => {});
      output({ results, total: results.length, query: normalizedQuery }, (data) => {
        if (data.results.length === 0) {
          console.log(chalk.yellow(`No results for "${normalizedQuery}".`));
          return;
        }
        console.log(chalk.bold(`${data.total} results for "${normalizedQuery}":\n`));
        formatEntryList(data.results, {
          showScores: !!opts.scores || !!opts.explain,
          showExplain: !!opts.explain,
        });
      }, globalOpts);
    });
}
