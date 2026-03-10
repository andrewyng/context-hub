import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import chalk from 'chalk';
import { getEntry, resolveDocPath, resolveEntryFile } from '../lib/registry.js';
import { normalizeLanguage } from '../lib/normalize.js';
import { fetchDoc, fetchDocFull } from '../lib/cache.js';
import { output, error, info } from '../lib/output.js';
import { trackEvent } from '../lib/analytics.js';
import { readAnnotation } from '../lib/annotations.js';
import { isValidEnvConfidence, matchEnvVersion } from '../lib/env-match.js';

const MATCH_ENV_VALUES = new Set(['python', 'node', 'auto']);
const MISMATCH_POLICY_VALUES = new Set(['strict', 'warn']);

function validateGetOptions(opts, globalOpts) {
  if (!opts.matchEnv) return;

  if (!MATCH_ENV_VALUES.has(opts.matchEnv)) {
    error(`Invalid value for --match-env: "${opts.matchEnv}". Use one of: python, node, auto.`, globalOpts);
  }

  if (!MISMATCH_POLICY_VALUES.has(opts.mismatch)) {
    error(`Invalid value for --mismatch: "${opts.mismatch}". Use one of: strict, warn.`, globalOpts);
  }

  if (opts.confidence && !isValidEnvConfidence(opts.confidence)) {
    error(
      `Invalid value for --confidence: "${opts.confidence}". Use one of: installed, locked, declared, unknown.`,
      globalOpts
    );
  }
}

function getResolvedLanguageObj(entry, requestedLang) {
  if (!entry.languages) return null;
  const normalizedLang = requestedLang ? normalizeLanguage(requestedLang) : null;
  if (normalizedLang) {
    return entry.languages.find((l) => l.language === normalizedLang) || null;
  }
  if (entry.languages.length === 1) return entry.languages[0];
  return null;
}

function buildEnvMatchErrorMessage(id, diagnostics) {
  if (diagnostics.status === 'undetermined') {
    return `Environment version is undetermined for "${id}" while using --mismatch strict. Provide --detected-version (and optionally --confidence).`;
  }
  return `Environment version mismatch for "${id}" in strict mode. Requested ${diagnostics.requestedVersion}; no compatible docs available.`;
}

/**
 * Fetch one or more entries by ID. Auto-detects doc vs skill per entry.
 */
async function fetchEntries(ids, opts, globalOpts) {
  validateGetOptions(opts, globalOpts);
  const results = [];

  for (const id of ids) {
    // Search both docs and skills — auto-detect type
    const result = getEntry(id);

    if (result.ambiguous) {
      error(
        `Multiple entries match "${id}". Use a source prefix:\n  ${result.alternatives.map((a) => `chub get ${a}`).join('\n  ')}`,
        globalOpts
      );
    }

    if (!result.entry) {
      error(`No doc or skill found with id "${id}".`, globalOpts);
    }

    const entry = result.entry;
    const type = entry.languages ? 'doc' : 'skill';
    const envMatchingEnabled = Boolean(opts.matchEnv) && type === 'doc';
    const mismatchPolicy = opts.mismatch || 'warn';
    let requestedVersion = opts.version;
    let envMatchDiagnostics = null;
    let resolved = null;

    if (envMatchingEnabled) {
      const langProbe = resolveDocPath(entry, opts.lang, null);
      if (!langProbe) {
        if (opts.lang && entry.languages) {
          const available = entry.languages.map((l) => l.language).join(', ');
          error(`Language "${opts.lang}" is not available for "${id}". Available languages: ${available}.`, globalOpts);
        } else {
          error(`No content found for "${id}".`, globalOpts);
        }
      }

      if (langProbe.needsLanguage) {
        error(
          `Multiple languages available for "${id}": ${langProbe.available.join(', ')}. Specify --lang.`,
          globalOpts
        );
      }

      const langObj = getResolvedLanguageObj(entry, opts.lang);
      const availableVersions = langObj?.versions?.map((v) => v.version) || [];
      const detectedVersion = opts.detectedVersion || opts.version || null;
      envMatchDiagnostics = {
        ...matchEnvVersion({
          availableVersions,
          detectedVersion,
          policy: mismatchPolicy,
        }),
        confidence: opts.confidence || 'unknown',
      };

      if (envMatchDiagnostics.status === 'exact' || envMatchDiagnostics.status === 'compatible') {
        requestedVersion = envMatchDiagnostics.selectedVersion;
      } else if (envMatchDiagnostics.status === 'mismatch') {
        if (mismatchPolicy === 'strict') {
          error(buildEnvMatchErrorMessage(id, envMatchDiagnostics), globalOpts);
        }
        requestedVersion = envMatchDiagnostics.selectedVersion || null;
      } else if (envMatchDiagnostics.status === 'undetermined') {
        if (mismatchPolicy === 'strict') {
          error(buildEnvMatchErrorMessage(id, envMatchDiagnostics), globalOpts);
        }
        requestedVersion = null;
      }

      resolved = resolveDocPath(entry, opts.lang, requestedVersion);
    } else {
      resolved = resolveDocPath(entry, opts.lang, opts.version);
    }

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
          results.push({
            id: entry.id,
            type,
            content,
            path: join(resolved.path, requested[0]),
            ...(envMatchDiagnostics ? { match: envMatchDiagnostics, policy: mismatchPolicy, warnings: envMatchDiagnostics.warnings } : {}),
          });
        } else {
          const allFiles = await fetchDocFull(resolved.source, resolved.path, requested);
          results.push({
            id: entry.id,
            type,
            files: allFiles,
            path: resolved.path,
            ...(envMatchDiagnostics ? { match: envMatchDiagnostics, policy: mismatchPolicy, warnings: envMatchDiagnostics.warnings } : {}),
          });
        }
      } else if (opts.full && resolved.files.length > 0) {
        const allFiles = await fetchDocFull(resolved.source, resolved.path, resolved.files);
        results.push({
          id: entry.id,
          type,
          files: allFiles,
          path: resolved.path,
          ...(envMatchDiagnostics ? { match: envMatchDiagnostics, policy: mismatchPolicy, warnings: envMatchDiagnostics.warnings } : {}),
        });
      } else {
        const content = await fetchDoc(resolved.source, entryFile.filePath);
        results.push({
          id: entry.id,
          type,
          content,
          path: entryFile.filePath,
          additionalFiles: refFiles,
          ...(envMatchDiagnostics ? { match: envMatchDiagnostics, policy: mismatchPolicy, warnings: envMatchDiagnostics.warnings } : {}),
        });
      }
    } catch (err) {
      error(`Failed to load "${id}": ${err.message}`, globalOpts);
    }
  }

  // Track fetches
  for (const r of results) {
    trackEvent(r.type === 'doc' ? 'doc_fetched' : 'skill_fetched', {
      entry_id: r.id,
      full: !!opts.full,
      lang: opts.lang || undefined,
    }).catch(() => {});
  }

  if (!globalOpts.json) {
    for (const r of results) {
      if (r.match && r.warnings?.length > 0) {
        for (const warning of r.warnings) {
          info(chalk.yellow(`Warning: ${warning}`));
        }
      }
    }
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
      const isDir = opts.output.endsWith('/');
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
      console.log(JSON.stringify(results.map((r) => ({
        id: r.id,
        type: r.type,
        path: opts.output,
        ...(r.match ? { policy: r.policy, match: r.match, warnings: r.warnings || [] } : {}),
      }))));
    }
  } else {
    if (results.length === 1 && !results[0].files) {
      const r = results[0];
      const extraFiles = r.additionalFiles || [];
      const annotation = readAnnotation(r.id);
      const jsonData = { id: r.id, type: r.type, content: r.content, path: r.path };
      if (extraFiles.length > 0) jsonData.additionalFiles = extraFiles;
      if (annotation) jsonData.annotation = annotation;
      if (r.match) {
        jsonData.policy = r.policy;
        jsonData.match = r.match;
        jsonData.warnings = r.warnings || [];
      }
      output(
        jsonData,
        (data) => {
          process.stdout.write(data.content);
          if (annotation) {
            process.stdout.write(`\n\n---\n[Agent note — ${annotation.updatedAt}]\n${annotation.note}\n`);
          }
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
        results.map((r) => ({
          id: r.id,
          type: r.type,
          path: r.path,
          ...(r.match ? { policy: r.policy, match: r.match, warnings: r.warnings || [] } : {}),
        })),
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
    .option('--lang <language>', 'Language variant (for docs)')
    .option('--version <version>', 'Specific version (for docs)')
    .option('--match-env <mode>', 'Env matching mode: python, node, or auto')
    .option('--mismatch <policy>', 'Mismatch policy: strict or warn', 'warn')
    .option('--detected-version <version>', 'Detected environment version hint')
    .option('--confidence <level>', 'Version hint confidence: installed|locked|declared|unknown')
    .option('-o, --output <path>', 'Write to file or directory')
    .option('--full', 'Fetch all files (not just entry point)')
    .option('--file <paths>', 'Fetch specific file(s) by path (comma-separated)')
    .action(async (ids, opts) => {
      const globalOpts = program.optsWithGlobals();
      await fetchEntries(ids, opts, globalOpts);
    });
}
