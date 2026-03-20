/**
 * Import document handler.
 * Handles markdown file upload and saves to content directory with proper structure.
 */

import { dirname, join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { parseFrontmatter } from '../../../cli/src/lib/frontmatter.js';
import { getAiConfig } from '../lib/ai-client.js';
import { appendImportHistory, createImportHistoryRecord } from '../lib/import-history.js';
import { repoPath, REPO_ROOT } from '../lib/paths.js';

/**
 * Validate import request fields.
 * Returns array of error objects or empty array if valid.
 */
function validateImportRequest(req) {
  const errors = [];

  if (!req.file) {
    errors.push({ field: 'file', message: 'No file uploaded' });
  } else if (!req.file.originalname.endsWith('.md')) {
    errors.push({ field: 'file', message: 'File must be a markdown file (.md)' });
  }

  if (!req.body.author) {
    errors.push({ field: 'author', message: 'Author is required' });
  } else if (!/^[a-z0-9-]+$/.test(req.body.author)) {
    errors.push({ field: 'author', message: 'Author must be lowercase alphanumeric with hyphens only' });
  }

  if (!req.body.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (!/^[a-z0-9-]+$/.test(req.body.name)) {
    errors.push({ field: 'name', message: 'Name must be lowercase alphanumeric with hyphens only' });
  }

  if (!req.body.description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  if (!req.body.version?.trim()) {
    errors.push({ field: 'version', message: 'Version is required' });
  }

  const source = req.body.source || 'community';
  if (!['official', 'maintainer', 'community'].includes(source)) {
    errors.push({ field: 'source', message: 'Source must be one of: official, maintainer, community' });
  }

  return errors;
}

/**
 * Generate YAML frontmatter string.
 */
export function normalizeDocMetadata(formData = {}) {
  const normalizedLanguage = formData.language && formData.language !== 'none'
    ? formData.language
    : 'text';
  const normalizedVersion = formData.version?.trim() || '1.0.0';

  return {
    ...formData,
    language: normalizedLanguage,
    version: normalizedVersion,
    revision: formData.revision || 1,
    source: formData.source || 'community',
    tags: formData.tags || '',
  };
}

export function stripFrontmatter(content) {
  const { body } = parseFrontmatter(content);
  return body.trim();
}

export function generateFrontmatter(formData) {
  const {
    name,
    description,
    language,
    version,
    revision = 1,
    source = 'community',
    tags = '',
  } = normalizeDocMetadata(formData);

  const today = new Date().toISOString().split('T')[0];
  const langLine = `  languages: "${language}"\n`;
  const tagsLine = tags ? `  tags: "${tags}"\n` : '';

  return `---
name: ${name}
description: "${description.replace(/"/g, '\\"')}"
metadata:
${langLine}  versions: "${version}"
  revision: ${revision}
  updated-on: "${today}"
  source: ${source}
${tagsLine}---
`;
}

/**
 * Resolve target file path for the document.
 */
function validatePathComponent(value, field) {
  if (!value || value.includes('..') || value.includes('/') || value.includes('\\')) {
    throw new Error(`Invalid ${field}`);
  }
}

export function resolveTargetPath(baseDir, { author, name, language }) {
  validatePathComponent(author, 'author');
  validatePathComponent(name, 'name');
  if (language && language !== 'none') {
    validatePathComponent(language, 'language');
    return join(baseDir, author, 'docs', name, language, 'DOC.md');
  }
  return join(baseDir, author, 'docs', name, 'DOC.md');
}

export function resolveSkillTargetPath(baseDir, { author, name }) {
  validatePathComponent(author, 'author');
  validatePathComponent(name, 'name');
  return join(baseDir, author, 'skills', name, 'SKILL.md');
}

export function generateSkillFrontmatter(formData = {}) {
  const {
    name,
    description,
    revision = 1,
    source = 'community',
    tags = '',
  } = formData;

  const today = new Date().toISOString().split('T')[0];
  const tagsLine = tags ? `  tags: "${tags}"
` : '';

  return `---
name: ${name}
description: "${String(description || '').replace(/"/g, '\\"')}"
metadata:
  revision: ${revision}
  updated-on: "${today}"
  source: ${source}
${tagsLine}---
`;
}

export function resolveEntryDir(targetPath) {
  return dirname(targetPath);
}

/**
 * Handle document import request.
 */
export async function handleImport(req, res) {
  const aiConfig = getAiConfig();
  const historyBase = {
    mode: 'single',
    request: {
      filename: req.file?.originalname || '',
      size: req.file?.size || req.file?.buffer?.length || 0,
      author: req.body?.author || '',
      name: req.body?.name || '',
      language: req.body?.language || '',
      version: req.body?.version || '',
      source: req.body?.source || 'community',
      tags: req.body?.tags || '',
    },
  };

  try {
    const errors = validateImportRequest(req);
    if (errors.length > 0) {
      appendImportHistory(createImportHistoryRecord({
        ...historyBase,
        status: 'error',
        errors: errors.map(error => ({ file: req.file?.originalname || '', error: error.message })),
        diagnostics: { aiUsed: false, model: aiConfig.model },
      }));
      return res.status(400).json({ status: 'error', errors });
    }

    const { file, body } = req;
    const contentDir = repoPath('content');

    const fileContent = file.buffer.toString('utf8');
    const { attributes: existingMeta, body: markdownBody } = parseFrontmatter(fileContent);

    const formData = normalizeDocMetadata({
      author: body.author,
      name: body.name,
      description: body.description || existingMeta.description || '',
      language: body.language || existingMeta.metadata?.languages || '',
      version: body.version || existingMeta.metadata?.versions || '1.0.0',
      revision: parseInt(body.revision, 10) || existingMeta.metadata?.revision || 1,
      source: body.source || existingMeta.metadata?.source || 'community',
      tags: body.tags || existingMeta.metadata?.tags || '',
    });

    const targetPath = resolveTargetPath(contentDir, formData);
    const targetDir = join(targetPath, '..');

    if (existsSync(targetPath)) {
      const payload = {
        status: 'error',
        error: 'Document already exists',
        id: `${formData.author}/${formData.name}`,
        path: targetPath,
        relativePath: targetPath.replace(REPO_ROOT + '/', ''),
        hint: 'Use a different author/name/language combination or manually edit/remove the existing file',
      };
      appendImportHistory(createImportHistoryRecord({
        ...historyBase,
        status: 'partial',
        summary: { total: 1, imported: 0, skipped: 1, failed: 0, reorganized: false },
        errors: [{ file: file.originalname, error: payload.error, id: payload.id, path: payload.relativePath }],
        diagnostics: { aiUsed: false, model: aiConfig.model },
      }));
      return res.status(409).json(payload);
    }

    mkdirSync(targetDir, { recursive: true });

    const frontmatter = generateFrontmatter(formData);
    const finalContent = frontmatter + '\n' + markdownBody.trim() + '\n';

    writeFileSync(targetPath, finalContent, 'utf8');

    const relativePath = targetPath.replace(REPO_ROOT + '/', '');
    const response = {
      status: 'success',
      path: relativePath,
      id: `${formData.author}/${formData.name}`,
      frontmatter: {
        name: formData.name,
        description: formData.description,
        metadata: {
          languages: formData.language || undefined,
          versions: formData.version,
          revision: formData.revision,
          source: formData.source,
          tags: formData.tags || undefined,
        },
      },
      message: 'Document imported successfully. Run "Rebuild Index" to make it searchable.',
    };

    appendImportHistory(createImportHistoryRecord({
      ...historyBase,
      status: 'success',
      summary: { total: 1, imported: 1, skipped: 0, failed: 0, reorganized: false },
      results: [{
        id: response.id,
        type: 'doc',
        path: response.path,
        language: formData.language,
        references: [],
        examples: [],
        sourcePath: file.originalname,
        originalSourcePath: file.originalname,
        aiGenerated: false,
      }],
      diagnostics: { aiUsed: false, model: aiConfig.model },
    }));

    res.json(response);
  } catch (err) {
    console.error('[import] Error:', err);
    appendImportHistory(createImportHistoryRecord({
      ...historyBase,
      status: 'error',
      errors: [{ file: req.file?.originalname || '', error: err.message }],
      diagnostics: { aiUsed: false, model: aiConfig.model },
    }));
    res.status(500).json({ status: 'error', error: err.message });
  }
}
