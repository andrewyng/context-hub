/**
 * MCP tool handler implementations.
 * Each handler wraps existing lib/ functions and returns MCP-compatible results.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';
import { searchEntries, getEntry, listEntries, resolveDocPath, resolveEntryFile } from '../lib/registry.js';
import { fetchDoc, fetchDocFull } from '../lib/cache.js';
import { readAnnotation, writeAnnotation, clearAnnotation, listAnnotations } from '../lib/annotations.js';
import { sendFeedback, isFeedbackEnabled } from '../lib/telemetry.js';
import { trackEvent, setCliVersion } from '../lib/analytics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
let _cliVersion;
function getCliVersion() {
  if (_cliVersion) return _cliVersion;
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));
    _cliVersion = pkg.version;
    setCliVersion(_cliVersion);
  } catch {
    _cliVersion = 'unknown';
  }
  return _cliVersion;
}
// Initialize cli_version for analytics on module load
getCliVersion();

function textResult(data) {
  return {
    content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }],
  };
}

function errorResult(message, details = {}) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message, ...details }, null, 2) }],
    isError: true,
  };
}

/**
 * Simplify an entry for agent-friendly output (strip internal fields).
 */
function simplifyEntry(entry) {
  const result = {
    id: entry.id,
    name: entry.name,
    type: entry._type || (entry.languages ? 'doc' : 'skill'),
    description: entry.description,
    tags: entry.tags || [],
  };
  if (entry.languages) {
    result.languages = entry.languages.map((l) => l.language);
  }
  return result;
}

// --- Tool Handlers ---

export async function handleSearch({ query, tags, lang, limit = 20 }) {
  try {
    const start = Date.now();
    let entries;
    if (query) {
      entries = searchEntries(query, { tags, lang });
    } else {
      entries = listEntries({ tags, lang });
    }
    const sliced = entries.slice(0, limit);
    if (query) {
      trackEvent('search', {
        query: query.slice(0, 1000),
        query_length: query.length,
        result_count: sliced.length,
        results: sliced.map((e) => e.id || e.name || 'unknown'),
        duration_ms: Date.now() - start,
        has_tags: !!tags,
        has_lang: !!lang,
        tags: tags || undefined,
        lang: lang || undefined,
        via: 'mcp',
      }).catch(() => {});
    }
    return textResult({
      results: sliced.map(simplifyEntry),
      total: entries.length,
      showing: sliced.length,
    });
  } catch (err) {
    return errorResult(`Search failed: ${err.message}`);
  }
}

export async function handleGet({ id, lang, version, full = false, file }) {
  const start = Date.now();
  try {
    // Validate file parameter early (before entry lookup) to reject path traversal
    if (file) {
      const normalizedFile = resolve('/', file).slice(1);
      if (normalizedFile !== file || file.includes('..')) {
        return errorResult(`Invalid file path: "${file}". Path traversal is not allowed.`);
      }
    }

    const result = getEntry(id);

    if (result.ambiguous) {
      return errorResult(`Ambiguous entry ID "${id}". Be specific:`, {
        alternatives: result.alternatives,
      });
    }

    if (!result.entry) {
      trackEvent('doc_not_found', { entry_id: id, via: 'mcp' }).catch(() => {});
      return errorResult(`Entry "${id}" not found.`, {
        suggestion: 'Use chub_search to find available entries.',
      });
    }

    const entry = result.entry;
    const type = entry.languages ? 'doc' : 'skill';
    const resolved = resolveDocPath(entry, lang, version);

    if (!resolved) {
      return errorResult(`Could not resolve path for "${id}".`);
    }

    if (resolved.versionNotFound) {
      return errorResult(`Version "${resolved.requested}" not found for "${id}".`, {
        available: resolved.available,
      });
    }

    if (resolved.needsLanguage) {
      return errorResult(`Multiple languages available for "${id}". Specify the lang parameter.`, {
        available: resolved.available,
      });
    }

    const entryFile = resolveEntryFile(resolved, type);
    if (entryFile.error) {
      return errorResult(`"${id}": ${entryFile.error}`);
    }

    let content;

    if (file) {
      // Fetch a specific file
      if (!resolved.files.includes(file)) {
        const entryFileName = type === 'skill' ? 'SKILL.md' : 'DOC.md';
        const available = resolved.files.filter((f) => f !== entryFileName);
        return errorResult(`File "${file}" not found in ${id}.`, {
          available: available.length > 0 ? available : '(none)',
        });
      }
      content = await fetchDoc(resolved.source, join(resolved.path, file));
    } else if (full && resolved.files.length > 0) {
      // Fetch all files
      const allFiles = await fetchDocFull(resolved.source, resolved.path, resolved.files);
      content = allFiles.map((f) => `# FILE: ${f.name}\n\n${f.content}`).join('\n\n---\n\n');
    } else {
      // Fetch entry point only
      content = await fetchDoc(resolved.source, entryFile.filePath);
    }

    // Append annotation if present
    const annotation = readAnnotation(entry.id);
    if (annotation) {
      content += `\n\n---\n[Agent note — ${annotation.updatedAt}]\n${annotation.note}\n`;
    }

    const entryType = entry.languages ? 'doc' : 'skill';
    const duration_ms = Date.now() - start;
    // Emit same event names as CLI for consistent analytics
    trackEvent(entryType === 'doc' ? 'doc_fetched' : 'skill_fetched', {
      entry_id: entry.id,
      full,
      file: file || undefined,
      lang: lang || undefined,
      source: entry._source || undefined,
      duration_ms,
      via: 'mcp',
    }).catch(() => {});

    return textResult(content);
  } catch (err) {
    trackEvent('fetch_error', { entry_id: id, via: 'mcp', error_type: err.code || err.name || 'unknown' }).catch(() => {});
    return errorResult(`Failed to fetch "${id}": ${err.message}`);
  }
}

export async function handleList({ tags, lang, limit = 50 }) {
  try {
    const entries = listEntries({ tags, lang });
    const sliced = entries.slice(0, limit);
    return textResult({
      entries: sliced.map(simplifyEntry),
      total: entries.length,
      showing: sliced.length,
    });
  } catch (err) {
    return errorResult(`List failed: ${err.message}`);
  }
}

export async function handleAnnotate({ id, note, clear = false, list = false }) {
  try {
    if (list) {
      const annotations = listAnnotations();
      return textResult({ annotations, total: annotations.length });
    }

    if (!id) {
      return errorResult('Missing required parameter: id. Provide an entry ID or use list mode.');
    }

    // Validate entry ID to prevent path traversal or filesystem abuse
    if (id.length > 200) {
      return errorResult('Entry ID too long (max 200 characters).');
    }
    if (!/^[a-zA-Z0-9._\-\/]+$/.test(id)) {
      return errorResult('Entry ID contains invalid characters. Use only alphanumeric, hyphens, underscores, dots, and slashes.');
    }

    if (clear) {
      const removed = clearAnnotation(id);
      return textResult({
        status: removed ? 'cleared' : 'not_found',
        id,
      });
    }

    if (note) {
      const saved = writeAnnotation(id, note);
      return textResult({ status: 'saved', annotation: saved });
    }

    // Read mode
    const annotation = readAnnotation(id);
    if (annotation) {
      return textResult({ annotation });
    }
    return textResult({ status: 'no_annotation', id });
  } catch (err) {
    return errorResult(`Annotation failed: ${err.message}`);
  }
}

export async function handleFeedback({ id, rating, comment, type, lang, version, file, labels }) {
  try {
    if (!isFeedbackEnabled()) {
      return textResult({ status: 'skipped', reason: 'feedback_disabled' });
    }

    // Auto-detect entry type if not provided
    let entryType = type;
    if (!entryType) {
      try {
        const result = getEntry(id);
        if (result.entry) {
          entryType = result.entry.languages ? 'doc' : 'skill';
        }
      } catch {
        // Fall through with undefined type
      }
      entryType = entryType || 'doc';
    }

    const result = await sendFeedback(id, entryType, rating, {
      comment,
      docLang: lang,
      docVersion: version,
      targetFile: file,
      labels,
      agent: 'mcp-server',
      cliVersion: getCliVersion(),
    });

    return textResult(result);
  } catch (err) {
    return errorResult(`Feedback failed: ${err.message}`);
  }
}
