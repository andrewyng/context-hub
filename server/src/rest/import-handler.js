/**
 * Import document handler.
 * Handles markdown file upload and saves to content directory with proper structure.
 */

import { join, resolve } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { parseFrontmatter } from '../../../cli/src/lib/frontmatter.js';

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
export function generateFrontmatter(formData) {
  const {
    name,
    description,
    language = '',
    version,
    revision = 1,
    source = 'community',
    tags = '',
  } = formData;

  const today = new Date().toISOString().split('T')[0];
  const langLine = language && language !== 'none' ? `  languages: "${language}"\n` : '';
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
export function resolveTargetPath(baseDir, { author, name, language }) {
  // Prevent path traversal
  if (author.includes('..') || name.includes('..') || (language && language.includes('..'))) {
    throw new Error('Invalid path components');
  }

  if (language && language !== 'none') {
    return join(baseDir, author, 'docs', name, language, 'DOC.md');
  }
  return join(baseDir, author, 'docs', name, 'DOC.md');
}

/**
 * Handle document import request.
 */
export async function handleImport(req, res) {
  try {
    // Validate request
    const errors = validateImportRequest(req);
    if (errors.length > 0) {
      return res.status(400).json({ status: 'error', errors });
    }

    const { file, body } = req;
    const contentDir = resolve(process.cwd(), 'content');

    // Parse existing frontmatter from uploaded file
    const fileContent = file.buffer.toString('utf8');
    const { attributes: existingMeta, body: markdownBody } = parseFrontmatter(fileContent);

    // Build form data (form values take precedence over existing frontmatter)
    const formData = {
      author: body.author,
      name: body.name,
      description: body.description || existingMeta.description || '',
      language: body.language || existingMeta.metadata?.languages || '',
      version: body.version || existingMeta.metadata?.versions || '1.0.0',
      revision: parseInt(body.revision, 10) || existingMeta.metadata?.revision || 1,
      source: body.source || existingMeta.metadata?.source || 'community',
      tags: body.tags || existingMeta.metadata?.tags || '',
    };

    // Generate target path
    const targetPath = resolveTargetPath(contentDir, formData);
    const targetDir = join(targetPath, '..');

    // Check if file already exists
    if (existsSync(targetPath)) {
      return res.status(409).json({
        status: 'error',
        error: 'Document already exists at this path',
        path: targetPath,
        hint: 'Use a different author/name/language combination or manually edit the existing file',
      });
    }

    // Create directory structure
    mkdirSync(targetDir, { recursive: true });

    // Generate frontmatter and combine with body
    const frontmatter = generateFrontmatter(formData);
    const finalContent = frontmatter + '\n' + markdownBody.trim() + '\n';

    // Write file
    writeFileSync(targetPath, finalContent, 'utf8');

    // Return success
    const relativePath = targetPath.replace(process.cwd() + '/', '');
    res.json({
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
    });
  } catch (err) {
    console.error('[import] Error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
}
