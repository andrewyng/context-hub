import chalk from 'chalk';
import { readAnnotation, writeAnnotation, clearAnnotation, listAnnotations } from '../lib/annotations.js';
import { getEntry, resolveDocPath } from '../lib/registry.js';
import { output, error, info } from '../lib/output.js';

/**
 * Resolve current doc metadata (version, lastUpdated) for integrity tracking.
 */
function resolveDocMeta(entryId) {
  try {
    const result = getEntry(entryId);
    if (!result.entry) return {};
    const entry = result.entry;
    const resolved = resolveDocPath(entry, null, null);
    if (!resolved || resolved.needsLanguage || resolved.versionNotFound) return {};
    // For docs, extract version and lastUpdated from the resolved version object
    if (entry.languages) {
      const langObj = entry.languages.length === 1 ? entry.languages[0] : null;
      if (langObj) {
        const rec = langObj.recommendedVersion;
        const verObj = langObj.versions?.find((v) => v.version === rec) || langObj.versions?.[0];
        if (verObj) {
          return { version: verObj.version, lastUpdated: verObj.lastUpdated };
        }
      }
    }
    // For skills, use lastUpdated from the entry directly
    if (entry.lastUpdated) {
      return { lastUpdated: entry.lastUpdated };
    }
    return {};
  } catch {
    return {};
  }
}

export function registerAnnotateCommand(program) {
  program
    .command('annotate [id] [note]')
    .description('Attach agent notes to a doc or skill')
    .option('--clear', 'Remove annotation for this entry')
    .option('--list', 'List all annotations')
    .action((id, note, opts) => {
      const globalOpts = program.optsWithGlobals();

      if (opts.list) {
        const annotations = listAnnotations();
        output(
          annotations,
          (data) => {
            if (data.length === 0) {
              console.log('No annotations.');
              return;
            }
            for (const a of data) {
              console.log(`${chalk.bold(a.id)} ${chalk.dim(`(${a.updatedAt})`)}`);
              console.log(`  ${a.note}`);
              console.log();
            }
          },
          globalOpts
        );
        return;
      }

      if (!id) {
        error('Missing required argument: <id>. Run: chub annotate <id> <note> | chub annotate <id> --clear | chub annotate --list', globalOpts);
      }

      if (opts.clear) {
        const removed = clearAnnotation(id);
        output(
          { id, cleared: removed },
          (data) => {
            if (data.cleared) {
              console.log(`Annotation cleared for ${chalk.bold(id)}.`);
            } else {
              console.log(`No annotation found for ${chalk.bold(id)}.`);
            }
          },
          globalOpts
        );
        return;
      }

      if (!note) {
        // Show existing annotation
        const existing = readAnnotation(id);
        if (existing) {
          output(
            existing,
            (data) => {
              console.log(`${chalk.bold(data.id)} ${chalk.dim(`(${data.updatedAt})`)}`);
              console.log(data.note);
            },
            globalOpts
          );
        } else {
          output(
            { id, note: null },
            () => console.log(`No annotation for ${chalk.bold(id)}.`),
            globalOpts
          );
        }
        return;
      }

      const docMeta = resolveDocMeta(id);
      const data = writeAnnotation(id, note, docMeta);
      output(
        data,
        (d) => console.log(`Annotation saved for ${chalk.bold(d.id)}.`),
        globalOpts
      );
    });
}
