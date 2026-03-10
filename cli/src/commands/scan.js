import chalk from 'chalk';
import { searchEntries, listEntries } from '../lib/registry.js';
import { parseDependencies, detectManifests } from '../lib/deps.js';
import { output, error, info } from '../lib/output.js';
import { trackEvent } from '../lib/analytics.js';

/**
 * Match project dependencies against the chub registry.
 *
 * Strategy: For each dependency name, run a registry search and keep
 * results where the dependency name appears in the entry id, name, or tags.
 * This avoids false positives from loose keyword matches.
 */
function matchDependencies(dependencies, filters = {}) {
  const allEntries = listEntries(filters);
  const matches = [];
  const misses = [];

  for (const dep of dependencies) {
    const q = dep.name.toLowerCase();
    let found = false;

    for (const entry of allEntries) {
      const idLower = entry.id.toLowerCase();
      const nameLower = (entry.name || '').toLowerCase();
      const tags = (entry.tags || []).map((t) => t.toLowerCase());

      // Match if the dependency name appears in the entry id, name, or tags
      const idMatch = idLower.includes(q) || idLower.split('/').some((seg) => seg === q);
      const nameMatch = nameLower.includes(q);
      const tagMatch = tags.some((t) => t === q || t.includes(q));

      // Also check reverse: entry id segment matching dependency name
      const authorOrName = idLower.split('/');
      const reverseMatch = authorOrName.some((seg) => q.includes(seg) && seg.length >= 3);

      if (idMatch || nameMatch || tagMatch || reverseMatch) {
        if (!matches.find((m) => m.entry.id === entry.id)) {
          matches.push({
            dependency: dep,
            entry: {
              id: entry.id,
              name: entry.name,
              type: entry._type || (entry.languages ? 'doc' : 'skill'),
              description: entry.description,
              languages: entry.languages ? entry.languages.map((l) => l.language) : undefined,
            },
          });
        }
        found = true;
      }
    }

    if (!found) {
      misses.push(dep);
    }
  }

  return { matches, misses };
}

/**
 * Scan command: detect project dependencies and find available chub docs.
 */
async function runScan(dir, opts, globalOpts) {
  const { manifests, dependencies } = parseDependencies(dir);

  if (manifests.length === 0) {
    error(
      `No dependency files found in ${dir}. Supported: package.json, requirements.txt, pyproject.toml, Pipfile, go.mod, Gemfile, Cargo.toml`,
      globalOpts
    );
  }

  const parseErrors = manifests.filter((m) => m.error);
  const depCount = dependencies.length;

  if (depCount === 0) {
    error(`Found ${manifests.map((m) => m.file).join(', ')} but no dependencies detected.`, globalOpts);
  }

  // Match against registry
  const { matches, misses } = matchDependencies(dependencies, {
    tags: opts.tags,
    lang: opts.lang,
  });

  // Track scan event
  trackEvent('scan', {
    manifest_count: manifests.length,
    dependency_count: depCount,
    match_count: matches.length,
    miss_count: misses.length,
  }).catch(() => {});

  // Build result
  const result = {
    manifests: manifests.map((m) => m.file),
    dependencies_found: depCount,
    matches: matches.map((m) => ({
      dependency: m.dependency.name,
      ecosystem: m.dependency.ecosystem,
      doc_id: m.entry.id,
      doc_type: m.entry.type,
      description: m.entry.description,
      languages: m.entry.languages,
    })),
    no_docs: opts.verbose ? misses.map((m) => m.name) : undefined,
    fetch_commands: matches.map((m) => {
      const lang = opts.lang ? ` --lang ${opts.lang}` : '';
      return `chub get ${m.entry.id}${lang}`;
    }),
  };

  // Human-friendly output
  output(result, (data) => {
    // Header
    console.log(
      chalk.bold(`Scanned ${data.manifests.join(', ')} — ${data.dependencies_found} dependencies\n`)
    );

    if (data.matches.length === 0) {
      console.log(chalk.yellow('No chub docs found for your project dependencies.'));
      console.log(chalk.dim('The registry is growing — check back soon or contribute docs!'));
      return;
    }

    // Matches
    console.log(chalk.green.bold(`${data.matches.length} docs available:\n`));
    for (const m of data.matches) {
      const langs = m.languages ? chalk.dim(`(${m.languages.join(', ')})`) : '';
      const type = m.doc_type === 'skill' ? chalk.magenta('[skill]') : chalk.blue('[doc]');
      console.log(`  ${chalk.bold(m.doc_id)}  ${type}  ${langs}`);
      console.log(`    ${chalk.dim('←')} ${m.dependency} ${chalk.dim(`[${m.ecosystem}]`)}`);
      if (m.description) {
        const desc = m.description.length > 70 ? m.description.slice(0, 67) + '...' : m.description;
        console.log(`    ${chalk.dim(desc)}`);
      }
    }

    // Fetch commands
    console.log(chalk.bold('\nFetch all:\n'));
    const ids = data.matches.map((m) => m.doc_id);
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length <= 5) {
      const lang = opts.lang ? ` --lang ${opts.lang}` : '';
      console.log(`  ${chalk.cyan(`chub get ${uniqueIds.join(' ')}${lang}`)}`);
    } else {
      for (const cmd of data.fetch_commands.slice(0, 10)) {
        console.log(`  ${chalk.cyan(cmd)}`);
      }
      if (data.fetch_commands.length > 10) {
        console.log(chalk.dim(`  ... and ${data.fetch_commands.length - 10} more`));
      }
    }

    // Misses summary
    if (misses.length > 0 && opts.verbose) {
      console.log(chalk.dim(`\n${misses.length} dependencies without docs (use --verbose to list)`));
    }
  }, globalOpts);
}

export function registerScanCommand(program) {
  program
    .command('scan [dir]')
    .description('Scan project dependencies and find available chub docs')
    .option('--lang <language>', 'Preferred language for fetch suggestions (e.g. py, js)')
    .option('--tags <tags>', 'Filter by tags (comma-separated)')
    .option('--verbose', 'Include dependencies with no docs in output')
    .action(async (dir, opts) => {
      const globalOpts = program.optsWithGlobals();
      const scanDir = dir || process.cwd();
      await runScan(scanDir, opts, globalOpts);
    });
}
