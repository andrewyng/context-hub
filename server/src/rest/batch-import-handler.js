/**
 * Batch import handler.
 * Scans markdown files inside a zip archive, classifies them as docs/skills/supporting
 * materials, asks AI to plan a strict context-hub import layout, validates the plan,
 * then writes normalized DOC.md or SKILL.md files plus supporting references/examples
 * without rewriting user content.
 */

import { basename, posix, join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import AdmZip from 'adm-zip';
import { parseFrontmatter } from '../../../cli/src/lib/frontmatter.js';
import {
  generateFrontmatter,
  generateSkillFrontmatter,
  normalizeDocMetadata,
  resolveEntryDir,
  resolveSkillTargetPath,
  resolveTargetPath,
  stripFrontmatter,
} from './import-handler.js';
import { getAiConfig, isAiAvailable, planBatchImport } from '../lib/ai-client.js';
import { appendImportHistory, createImportHistoryRecord } from '../lib/import-history.js';
import { repoPath, REPO_ROOT } from '../lib/paths.js';

const VALID_SOURCES = ['official', 'maintainer', 'community'];
const VALID_ENTRY_TYPES = new Set(['doc', 'skill']);
const VALID_SUPPORT_TYPES = new Set(['reference', 'example']);
const HIGH_CONFIDENCE = 'high';
const MEDIUM_CONFIDENCE = 'medium';
const LOW_CONFIDENCE = 'low';

function inferLanguageFromContent(content) {
  const lower = content.toLowerCase();
  if (lower.includes('```python') || lower.includes('pip install') || lower.includes('import ')) return 'python';
  if (lower.includes('```typescript') || lower.includes('interface ') || lower.includes('npm install')) return 'typescript';
  if (lower.includes('```javascript') || lower.includes('const ') || lower.includes('node ')) return 'javascript';
  if (lower.includes('```java') || lower.includes('public class ') || lower.includes('maven')) return 'java';
  if (lower.includes('```go') || lower.includes('package main') || lower.includes('go mod')) return 'go';
  if (lower.includes('```rust') || lower.includes('cargo ') || lower.includes('fn main')) return 'rust';
  if (lower.includes('```shell') || lower.includes('curl ') || lower.includes('bash ')) return 'shell';
  return 'text';
}

function normalizeSlug(value, fallback) {
  const normalized = String(value || fallback || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || fallback;
}

function normalizeArchivePath(entryName) {
  return String(entryName || '')
    .replace(/\\+/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\//, '');
}

function detectSupportType(lowerPath, lowerTitle) {
  if (lowerPath.includes('/example') || lowerPath.includes('/examples/') || lowerTitle.includes('example')) return 'example';
  return 'reference';
}

function detectEntryType(entryName, attributes, body, title) {
  const baseName = posix.basename(entryName);
  const lowerPath = entryName.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerBody = body.toLowerCase();
  const skillSignals = [
    'trigger on:',
    'when to use',
    'use this skill',
    'activation',
    'workflow',
    'follow this process',
    'quick diagnosis',
    '故障排查',
    '快速诊断',
  ];
  const docSignals = ['api reference', 'release notes', 'installation', 'dependency', 'maven', 'pip install'];
  const skillMatches = skillSignals.filter(signal => lowerBody.includes(signal) || lowerTitle.includes(signal));
  const docMatches = docSignals.filter(signal => lowerBody.includes(signal) || lowerTitle.includes(signal));

  if (baseName === 'DOC.md') {
    return { entryType: 'doc', kindHint: 'doc-main', classificationReason: 'filename DOC.md', classificationConfidence: HIGH_CONFIDENCE };
  }
  if (baseName === 'SKILL.md') {
    return { entryType: 'skill', kindHint: 'skill-main', classificationReason: 'filename SKILL.md', classificationConfidence: HIGH_CONFIDENCE };
  }
  if (lowerPath.includes('/skills/')) {
    return { entryType: 'skill', kindHint: 'skill-main', classificationReason: 'path contains /skills/', classificationConfidence: HIGH_CONFIDENCE };
  }
  if (lowerPath.includes('/docs/')) {
    return { entryType: 'doc', kindHint: 'doc-main', classificationReason: 'path contains /docs/', classificationConfidence: HIGH_CONFIDENCE };
  }
  if (skillMatches.length > 0) {
    return { entryType: 'skill', kindHint: 'skill-main', classificationReason: `skill signals: ${skillMatches.join(', ')}`, classificationConfidence: skillMatches.length > 1 ? HIGH_CONFIDENCE : MEDIUM_CONFIDENCE };
  }
  if (attributes.metadata?.languages || attributes.metadata?.versions) {
    return { entryType: 'doc', kindHint: 'doc-main', classificationReason: 'doc frontmatter metadata present', classificationConfidence: HIGH_CONFIDENCE };
  }
  if (lowerTitle.includes('skill')) {
    return { entryType: 'skill', kindHint: 'skill-main', classificationReason: 'title contains skill', classificationConfidence: MEDIUM_CONFIDENCE };
  }
  if (docMatches.length > 0 || lowerTitle.includes('reference')) {
    return { entryType: 'doc', kindHint: 'doc-main', classificationReason: `doc signals: ${docMatches.join(', ') || 'title contains reference'}`, classificationConfidence: MEDIUM_CONFIDENCE };
  }
  if ((lowerTitle.includes('guide') || lowerTitle.includes('overview') || lowerTitle.includes('sdk')) && skillMatches.length === 0) {
    return { entryType: 'doc', kindHint: 'doc-main', classificationReason: 'title suggests guide/overview/sdk', classificationConfidence: LOW_CONFIDENCE };
  }

  return {
    entryType: null,
    kindHint: detectSupportType(lowerPath, lowerTitle),
    classificationReason: 'no strong entry signal; treated as support file',
    classificationConfidence: LOW_CONFIDENCE,
  };
}

function summarizeMarkdownFile(entry) {
  const originalPath = entry.entryName;
  const normalizedPath = normalizeArchivePath(originalPath);
  const content = entry.getData().toString('utf8');
  const { attributes, body } = parseFrontmatter(content);
  const lines = body.split('\n').map(line => line.trim()).filter(Boolean);
  const titleLine = lines.find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.slice(2).trim() : posix.basename(normalizedPath, posix.extname(normalizedPath));
  const excerpt = lines.slice(0, 12).join('\n').slice(0, 1200);
  const detected = detectEntryType(normalizedPath, attributes, body, title);

  return {
    path: normalizedPath,
    originalPath,
    content,
    body,
    title,
    excerpt,
    existingMeta: attributes,
    languageHint: attributes.metadata?.languages || inferLanguageFromContent(content),
    entryType: detected.entryType,
    kindHint: detected.kindHint,
    classificationReason: detected.classificationReason,
    classificationConfidence: detected.classificationConfidence,
  };
}

function collectMarkdownFiles(zip) {
  return zip.getEntries()
    .filter(entry => {
      const normalizedPath = normalizeArchivePath(entry.entryName).toLowerCase();
      return !entry.isDirectory && !normalizedPath.includes('__macosx') && normalizedPath.endsWith('.md');
    })
    .map(summarizeMarkdownFile);
}

function defaultEntryName(file, type) {
  if (file.existingMeta.name) return normalizeSlug(file.existingMeta.name, type === 'skill' ? 'imported-skill' : 'imported-doc');
  const stem = posix.basename(file.path, posix.extname(file.path));
  if (stem.toUpperCase() === 'DOC' || stem.toUpperCase() === 'SKILL') {
    const parts = file.path.split('/').filter(Boolean);
    if (parts.length >= 2) return normalizeSlug(parts[parts.length - 2], type === 'skill' ? 'imported-skill' : 'imported-doc');
  }
  return normalizeSlug(stem, type === 'skill' ? 'imported-skill' : 'imported-doc');
}

function buildFallbackPlan(files, defaultAuthor, defaultSource) {
  const skillMain = files.find(file => posix.basename(file.path) === 'SKILL.md' || (file.entryType === 'skill' && file.classificationConfidence === HIGH_CONFIDENCE));
  if (skillMain) {
    const attachedSupport = files
      .filter(file => file.path !== skillMain.path)
      .map(file => ({ path: file.path, role: file.kindHint === 'example' ? 'example' : 'reference' }));

    return {
      entries: [{
        type: 'skill',
        author: defaultAuthor,
        name: defaultEntryName(skillMain, 'skill'),
        description: skillMain.existingMeta.description || `${skillMain.title} skill`,
        source: skillMain.existingMeta.metadata?.source || defaultSource,
        mainFile: skillMain.path,
        supportFiles: attachedSupport,
      }],
    };
  }

  const primaryFiles = files.filter(file => file.entryType && !file.path.startsWith('references/'));
  const supportFiles = files.filter(file => !file.entryType || file.path.startsWith('references/'));
  const entries = primaryFiles.map(file => {
    const entryType = file.entryType || 'doc';
    const base = {
      type: entryType,
      author: defaultAuthor,
      name: defaultEntryName(file, entryType),
      description: file.existingMeta.description || `${file.title} ${entryType === 'skill' ? 'skill' : 'documentation'}`,
      source: file.existingMeta.metadata?.source || defaultSource,
      mainFile: file.path,
      supportFiles: [],
    };

    if (entryType === 'doc') {
      return {
        ...base,
        language: file.existingMeta.metadata?.languages || file.languageHint || 'text',
        version: file.existingMeta.metadata?.versions || '1.0.0',
      };
    }

    return base;
  });

  if (entries.length === 0 && files.length > 0) {
    const first = files[0];
    entries.push({
      type: 'doc',
      author: defaultAuthor,
      name: defaultEntryName(first, 'doc'),
      description: first.existingMeta.description || `${first.title} documentation`,
      source: first.existingMeta.metadata?.source || defaultSource,
      language: first.existingMeta.metadata?.languages || first.languageHint || 'text',
      version: first.existingMeta.metadata?.versions || '1.0.0',
      mainFile: first.path,
      supportFiles: supportFiles.filter(file => file.path !== first.path).map(file => ({ path: file.path, role: file.kindHint })),
    });
  } else if (entries.length > 0 && supportFiles.length > 0) {
    entries[0].supportFiles = supportFiles
      .filter(file => file.path !== entries[0].mainFile)
      .map(file => ({ path: file.path, role: file.kindHint }));
  }

  return { entries };
}

function normalizeSupportFiles(rawSupportFiles, filesByPath, mainFile, entryLabel, errors) {
  const supportFiles = [];
  const seen = new Set();

  for (const rawSupport of rawSupportFiles || []) {
    const rawSupportPath = typeof rawSupport === 'string' ? rawSupport : rawSupport?.path;
    const supportPath = normalizeArchivePath(rawSupportPath);
    if (!supportPath || supportPath === mainFile || seen.has(supportPath)) continue;
    const file = filesByPath.get(supportPath);
    if (!file) {
      errors.push({ file: supportPath, originalSourcePath: rawSupportPath || supportPath, error: `AI plan references missing supporting file for ${entryLabel}` });
      continue;
    }
    const role = VALID_SUPPORT_TYPES.has(rawSupport?.role) ? rawSupport.role : file.kindHint === 'example' ? 'example' : 'reference';
    supportFiles.push({ path: supportPath, originalPath: file.originalPath, role });
    seen.add(supportPath);
  }

  return supportFiles;
}

function validatePlan(plan, filesByPath, defaultAuthor, defaultSource) {
  const errors = [];
  const normalizedEntries = [];
  const usedMainFiles = new Set();

  for (const rawEntry of plan.entries || []) {
    const type = VALID_ENTRY_TYPES.has(rawEntry.type) ? rawEntry.type : 'doc';
    const normalizedAuthor = normalizeSlug(rawEntry.author, '');
    const author = normalizedAuthor || defaultAuthor || 'imported';
    const name = normalizeSlug(rawEntry.name, type === 'skill' ? 'imported-skill' : 'imported-doc');
    const description = String(rawEntry.description || `${name} ${type === 'skill' ? 'skill' : 'documentation'}`);
    const source = VALID_SOURCES.includes(rawEntry.source) ? rawEntry.source : defaultSource;
    const mainFile = normalizeArchivePath(rawEntry.mainFile);
    const entryLabel = `${author}/${name}`;

    const file = filesByPath.get(mainFile);
    if (!file) {
      errors.push({ file: mainFile || name, originalSourcePath: rawEntry.mainFile || mainFile || name, error: `AI plan references missing main file for ${entryLabel}` });
      continue;
    }
    if (usedMainFiles.has(mainFile)) {
      errors.push({ file: mainFile, originalSourcePath: file.originalPath, error: `Main file assigned to multiple entries: ${entryLabel}` });
      continue;
    }
    usedMainFiles.add(mainFile);

    if (type === 'skill' && file.entryType === 'doc' && file.classificationConfidence === HIGH_CONFIDENCE) {
      errors.push({ file: mainFile, originalSourcePath: file.originalPath, error: `Plan classified document as skill for ${entryLabel}` });
      continue;
    }
    if (type === 'doc' && file.entryType === 'skill' && file.classificationConfidence === HIGH_CONFIDENCE) {
      errors.push({ file: mainFile, originalSourcePath: file.originalPath, error: `Plan classified skill as document for ${entryLabel}` });
      continue;
    }

    const supportFiles = normalizeSupportFiles(rawEntry.supportFiles, filesByPath, mainFile, entryLabel, errors);

    if (type === 'doc') {
      normalizedEntries.push({
        type,
        author,
        name,
        description,
        source,
        language: normalizeSlug(rawEntry.language, file.languageHint || 'text'),
        version: String(rawEntry.version || '1.0.0'),
        mainFile,
        originalMainFile: file.originalPath,
        supportFiles,
        classificationReason: file.classificationReason,
        classificationConfidence: file.classificationConfidence,
        aiOverride: file.entryType && file.entryType !== type,
      });
      continue;
    }

    normalizedEntries.push({
      type,
      author,
      name,
      description,
      source,
      mainFile,
      originalMainFile: file.originalPath,
      supportFiles,
      classificationReason: file.classificationReason,
      classificationConfidence: file.classificationConfidence,
      aiOverride: file.entryType && file.entryType !== type,
    });
  }

  return { entries: normalizedEntries, errors };
}

function buildDocContent(entry, file) {
  const normalized = normalizeDocMetadata({
    name: entry.name,
    description: entry.description,
    language: entry.language || file.languageHint || 'text',
    version: entry.version,
    source: entry.source,
    revision: 1,
    tags: file.existingMeta.metadata?.tags || '',
  });

  return generateFrontmatter(normalized) + '\n' + stripFrontmatter(file.content) + '\n';
}

function buildSkillContent(entry, file) {
  return generateSkillFrontmatter({
    name: entry.name,
    description: entry.description,
    source: entry.source,
    revision: 1,
    tags: file.existingMeta.metadata?.tags || '',
  }) + '\n' + stripFrontmatter(file.content) + '\n';
}

function writeSupportFiles(targetDir, supportFiles, filesByPath) {
  if (supportFiles.length === 0) return { references: [], examples: [] };

  const written = { references: [], examples: [] };

  for (const support of supportFiles) {
    const file = filesByPath.get(support.path);
    if (!file) continue;
    const subdir = support.role === 'example' ? 'examples' : 'references';
    const outputDir = join(targetDir, subdir);
    mkdirSync(outputDir, { recursive: true });
    const target = join(outputDir, posix.basename(support.path));
    writeFileSync(target, stripFrontmatter(file.content) + '\n', 'utf8');
    written[subdir].push(target.replace(REPO_ROOT + '/', ''));
  }

  return written;
}

export async function handleBatchImport(req, res) {
  const aiConfig = getAiConfig();
  const historyBase = {
    mode: 'batch',
    request: {
      filename: req.file?.originalname || '',
      size: req.file?.size || req.file?.buffer?.length || 0,
      defaultAuthor: req.body?.defaultAuthor || '',
      source: req.body?.source || 'community',
      useAi: req.body?.useAi !== 'false',
    },
  };

  try {
    if (!req.file) {
      const payload = { status: 'error', error: 'No file uploaded' };
      appendImportHistory(createImportHistoryRecord({
        ...historyBase,
        status: 'error',
        errors: [{ file: '', error: payload.error }],
        diagnostics: { aiUsed: false, model: aiConfig.model },
      }));
      return res.status(400).json(payload);
    }
    if (!req.file.originalname.endsWith('.zip')) {
      const payload = { status: 'error', error: 'File must be a .zip archive' };
      appendImportHistory(createImportHistoryRecord({
        ...historyBase,
        status: 'error',
        errors: [{ file: req.file.originalname, error: payload.error }],
        diagnostics: { aiUsed: false, model: aiConfig.model },
      }));
      return res.status(400).json(payload);
    }

    const defaultAuthor = normalizeSlug(req.body.defaultAuthor, 'imported');
    if (!defaultAuthor) {
      const payload = { status: 'error', error: 'defaultAuthor is required' };
      appendImportHistory(createImportHistoryRecord({
        ...historyBase,
        status: 'error',
        errors: [{ file: req.file.originalname, error: payload.error }],
        diagnostics: { aiUsed: false, model: aiConfig.model },
      }));
      return res.status(400).json(payload);
    }

    const defaultSource = VALID_SOURCES.includes(req.body.source) ? req.body.source : 'community';
    const useAi = req.body.useAi !== 'false';

    let zip;
    try {
      zip = new AdmZip(req.file.buffer);
    } catch (err) {
      const payload = { status: 'error', error: `Invalid zip file: ${err.message}` };
      appendImportHistory(createImportHistoryRecord({
        ...historyBase,
        status: 'error',
        errors: [{ file: req.file.originalname, error: payload.error }],
        diagnostics: { aiUsed: false, model: aiConfig.model },
      }));
      return res.status(400).json(payload);
    }

    const files = collectMarkdownFiles(zip);
    if (files.length === 0) {
      const payload = { status: 'error', error: 'No markdown files found in the zip archive.' };
      appendImportHistory(createImportHistoryRecord({
        ...historyBase,
        status: 'error',
        errors: [{ file: req.file.originalname, error: payload.error }],
        diagnostics: { aiUsed: false, model: aiConfig.model },
      }));
      return res.status(400).json(payload);
    }

    const filesByPath = new Map(files.map(file => [file.path, file]));
    const normalizedBackslashPaths = files.filter(file => file.originalPath !== file.path).length;

    let rawPlan;
    let aiPlanned = false;
    if (useAi && isAiAvailable()) {
      try {
        rawPlan = await planBatchImport(files);
        aiPlanned = true;
      } catch (err) {
        console.warn(`[batch-import] AI plan failed, falling back to local plan: ${err.message}`);
      }
    }

    if (!rawPlan) {
      rawPlan = buildFallbackPlan(files, defaultAuthor, defaultSource);
    }

    const { entries, errors: planErrors } = validatePlan(rawPlan, filesByPath, defaultAuthor, defaultSource);
    const errors = [...planErrors];
    const results = [];
    const contentDir = repoPath('content');

    for (const entry of entries) {
      const file = filesByPath.get(entry.mainFile);
      if (!file) continue;

      const targetPath = entry.type === 'skill'
        ? resolveSkillTargetPath(contentDir, { author: entry.author, name: entry.name })
        : resolveTargetPath(contentDir, { author: entry.author, name: entry.name, language: entry.language });

      if (existsSync(targetPath)) {
        errors.push({
          file: entry.mainFile,
          originalSourcePath: entry.originalMainFile,
          error: 'Document already exists',
          id: `${entry.author}/${entry.name}`,
          path: targetPath,
          relativePath: targetPath.replace(REPO_ROOT + '/', ''),
        });
        continue;
      }

      const targetDir = resolveEntryDir(targetPath);
      mkdirSync(targetDir, { recursive: true });
      const content = entry.type === 'skill' ? buildSkillContent(entry, file) : buildDocContent(entry, file);
      writeFileSync(targetPath, content, 'utf8');
      const writtenSupport = writeSupportFiles(targetDir, entry.supportFiles, filesByPath);

      results.push({
        file: entry.mainFile,
        sourcePath: entry.mainFile,
        originalSourcePath: entry.originalMainFile,
        id: `${entry.author}/${entry.name}`,
        type: entry.type,
        path: targetPath.replace(REPO_ROOT + '/', ''),
        references: writtenSupport.references,
        examples: writtenSupport.examples,
        language: entry.type === 'doc' ? entry.language : null,
        aiGenerated: aiPlanned,
        reorganized: true,
        classificationReason: entry.classificationReason,
        classificationConfidence: entry.classificationConfidence,
        aiOverride: entry.aiOverride,
      });
    }

    const response = {
      status: 'success',
      total: files.length,
      imported: results.length,
      skipped: errors.filter(e => e.error === 'Document already exists').length,
      failed: errors.filter(e => e.error !== 'Document already exists').length,
      reorganized: aiPlanned,
      results,
      errors,
    };

    appendImportHistory(createImportHistoryRecord({
      ...historyBase,
      status: response.failed > 0 || response.skipped > 0 ? 'partial' : 'success',
      summary: {
        total: response.total,
        imported: response.imported,
        skipped: response.skipped,
        failed: response.failed,
        reorganized: response.reorganized,
      },
      results,
      errors,
      diagnostics: {
        aiUsed: aiPlanned,
        model: aiConfig.model,
        normalizedBackslashPaths,
      },
    }));

    res.json(response);
  } catch (err) {
    console.error('[batch-import] Error:', err);
    appendImportHistory(createImportHistoryRecord({
      ...historyBase,
      status: 'error',
      errors: [{ file: req.file?.originalname || '', error: err.message }],
      diagnostics: { aiUsed: historyBase.request.useAi && isAiAvailable(), model: aiConfig.model },
    }));
    res.status(500).json({ status: 'error', error: err.message });
  }
}
