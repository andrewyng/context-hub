import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import chalk from 'chalk';
import { getEntry, resolveDocPath, resolveEntryFile } from '../lib/registry.js';
import { fetchDoc, fetchDocFull } from '../lib/cache.js';
import { output, error, info } from '../lib/output.js';
import { trackEvent } from '../lib/analytics.js';
import { readAnnotation } from '../lib/annotations.js';

/**
 * Fetch one or more entries by ID. Auto-detects doc vs skill per entry.
 */
async function fetchEntries(ids, opts, globalOpts) {
  const results = [];

  for (const id of ids) {
    const fetchStart = Date.now();

    // Search both docs and skills — auto-detect type
    const result = getEntry(id);

    if (result.ambiguous) {
      error(
        `Multiple entries match "${id}". Use a source prefix:\n  ${result.alternatives.map((a) => `chub get ${a}`).join('\n  ')}`,
        globalOpts
      );
    }

    if (!result.entry) {
      await trackEvent('doc_not_found', { entry_id: id });
      error(`No doc or skill found with id "${id}".`, globalOpts);
    }

    const entry = result.entry;
    const type = entry.languages ? 'doc' : 'skill';
    const resolved = resolveDocPath(entry, opts.lang, opts.version);

    if (!resolved) {
      if (opts.lang && entry.languages) {
        const available = entry.languages.map((l) => l.language).join(', ');
        error(`Language "${opts.lang}" is not available for "${id}". Available languages: ${available}.`, globalOpts);
      } else {
        error(`No content found for "${id}".`, globalOpts);
      }
    }

    if (resolved.versionNotFound) {
      error(
        `Version "${resolved.requested}" not found for "${id}". Available versions: ${resolved.available.join(', ')}`,
        globalOpts
      );
    }

    if (resolved.needsLanguage) {
      error(
        `Multiple languages available for "${id}": ${resolved.available.join(', ')}. Specify --lang.`,
        globalOpts
      );
    }

    const entryFile = resolveEntryFile(resolved, type);
    if (entryFile.error) {
      error(`No content available for "${id}". Check that the source contains a valid DOC.md or SKILL.md, or run \`chub update\` to refresh remote registries.`, globalOpts);
    }

    // Determine which reference files exist (beyond DOC.md/SKILL.md)
    const entryFileName = type === 'skill' ? 'SKILL.md' : 'DOC.md';
    const refFiles = resolved.files.filter((f) => f !== entryFileName);

    try {
      if (opts.file) {
        // --file mode: fetch specific file(s) by path
        const requested = opts.file.split(',').map((f) => f.trim());
        const invalid = requested.filter((f) => !resolved.files.includes(f));
        if (invalid.length > 0) {
          const available = refFiles.length > 0 ? refFiles.join(', ') : '(none)';
          error(`File "${invalid[0]}" not found in ${id}. Available: ${available}`, globalOpts);
        }
        if (requested.length === 1) {
          const content = await fetchDoc(resolved.source, join(resolved.path, requested[0]));
          results.push({ id: entry.id, type, content, path: join(resolved.path, requested[0]), source: entry._source, fetchStart, fetchDone: Date.now() });
        } else {
          const allFiles = await fetchDocFull(resolved.source, resolved.path, requested);
          results.push({ id: entry.id, type, files: allFiles, path: resolved.path, source: entry._source, fetchStart, fetchDone: Date.now() });
        }
      } else if (opts.full && resolved.files.length > 0) {
        const allFiles = await fetchDocFull(resolved.source, resolved.path, resolved.files);
        results.push({ id: entry.id, type, files: allFiles, path: resolved.path, source: entry._source, fetchStart, fetchDone: Date.now() });
      } else {
        const content = await fetchDoc(resolved.source, entryFile.filePath);
        results.push({ id: entry.id, type, content, path: entryFile.filePath, additionalFiles: refFiles, source: entry._source, fetchStart, fetchDone: Date.now() });
      }
    } catch (err) {
      await trackEvent('fetch_error', {
        entry_id: entry.id,
        error_type: err.code || err.name || 'unknown',
      });
      error(`Failed to load "${id}": ${err.message}`, globalOpts);
    }
  }

  // Track fetches
  for (const r of results) {
    trackEvent(r.type === 'doc' ? 'doc_fetched' : 'skill_fetched', {
      entry_id: r.id,
      full: !!opts.full,
      file: opts.file || undefined,
      lang: opts.lang || undefined,
      source: r.source || undefined,
      duration_ms: r.fetchDone - r.fetchStart,
    }).catch(() => {});
  }

  // Output
  if (opts.output) {
    if (opts.full) {
      for (const r of results) {
        if (r.files) {
          const baseDir = ids.length > 1 ? join(opts.output, r.id) : opts.output;
          mkdirSync(baseDir, { recursive: true });
          for (const f of r.files) {
            const outPath = join(baseDir, f.name);
            mkdirSync(dirname(outPath), { recursive: true });
            writeFileSync(outPath, f.content);
          }
          info(`Written ${r.files.length} files to ${baseDir}`);
        } else {
          const outPath = join(opts.output, `${r.id}.md`);
          mkdirSync(dirname(outPath), { recursive: true });
          writeFileSync(outPath, r.content);
          info(`Written to ${outPath}`);
        }
      }
    } else {
      const isDir = opts.output.endsWith('/') || opts.output.endsWith('\\');
      if (isDir && results.length > 1) {
        mkdirSync(opts.output, { recursive: true });
        for (const r of results) {
          const outPath = join(opts.output, `${r.id}.md`);
          mkdirSync(dirname(outPath), { recursive: true });
          writeFileSync(outPath, r.content);
          info(`Written to ${outPath}`);
        }
      } else {
        const outPath = isDir ? join(opts.output, `${results[0].id}.md`) : opts.output;
        mkdirSync(dirname(outPath), { recursive: true });
        const combined = results.map((r) => r.content).join('\n\n---\n\n');
        writeFileSync(outPath, combined);
        info(`Written to ${outPath}`);
      }
    }
    if (globalOpts.json) {
      console.log(JSON.stringify(results.map((r) => ({ id: r.id, type: r.type, path: opts.output }))));
    }
  } else {
    if (results.length === 1 && !results[0].files) {
      const r = results[0];
      const extraFiles = r.additionalFiles || [];
      const annotation = readAnnotation(r.id);
      const jsonData = { id: r.id, type: r.type, content: r.content, path: r.path };
      if (extraFiles.length > 0) jsonData.additionalFiles = extraFiles;
      if (annotation) jsonData.annotation = annotation;
      output(
        jsonData,
        (data) => {
          process.stdout.write(data.content);
          if (annotation) {
            process.stdout.write(`\n\n---\n[Agent note — ${annotation.updatedAt}]\n${annotation.note}\n`);
          }
          const langFlag = opts.lang ? ` --lang ${opts.lang}` : '';
          process.stdout.write(`\n\n---\nAfter using this doc, share your experience:\n`);
          process.stdout.write(`  chub feedback ${r.id} up${langFlag}\n`);
          process.stdout.write(`  chub feedback ${r.id} down${langFlag} --label outdated\n`);
          process.stdout.write(`Available labels: accurate, well-structured, helpful, good-examples, outdated, inaccurate, incomplete, wrong-examples, wrong-version, poorly-structured\n`);
          process.stdout.write(`Do NOT include any code, architecture details, or project-specific information in your feedback.\n`);
          if (extraFiles.length > 0) {
            const fileList = extraFiles.map((f) => `  ${f}`).join('\n');
            const example = `chub get ${r.id} --file ${extraFiles[0]}`;
            process.stdout.write(`\n\n---\nAdditional files available (use --file to fetch):\n${fileList}\nExample: ${example}\n`);
          }
        },
        globalOpts
      );
    } else {
      const parts = results.flatMap((r) => {
        if (r.files) {
          return r.files.map((f) => `# FILE: ${f.name}\n\n${f.content}`);
        }
        return [r.content];
      });
      const combined = parts.join('\n\n---\n\n');
      output(
        results.map((r) => ({ id: r.id, type: r.type, path: r.path })),
        () => process.stdout.write(combined),
        globalOpts
      );
    }
  }
}

export function registerGetCommand(program) {
  program
    .command('get <ids...>')
    .description('Fetch docs or skills by ID (auto-detects type)')
    .option('--lang <language>', 'Language variant (required for docs): py, js, ts, rb, cs, pwsh (or full names: python, javascript, typescript, ruby, csharp, powershell)')
    .option('--version <version>', 'Specific version (for docs)')
    .option('-o, --output <path>', 'Write to file or directory')
    .option('--full', 'Fetch all files (not just entry point)')
    .option('--file <paths>', 'Fetch specific file(s) by path (comma-separated)')
    .action(async (ids, opts) => {
      const globalOpts = program.optsWithGlobals();
      await fetchEntries(ids, opts, globalOpts);
    });
}
