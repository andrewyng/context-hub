/**
 * Batch import handler.
 * Processes zip archives containing multiple markdown documents.
 * Supports mixed directory structures and AI-assisted frontmatter generation.
 */

import { join, resolve, basename, dirname, relative } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import AdmZip from 'adm-zip';
import { parseFrontmatter } from '../../../cli/src/lib/frontmatter.js';
import { generateFrontmatter, resolveTargetPath } from './import-handler.js';
import { isAiAvailable, generateFrontmatter as aiGenerateFrontmatter } from '../lib/ai-client.js';

/**
 * Scan zip entries and collect DOC.md / SKILL.md files.
 * Returns array of { entryPath, type: 'doc'|'skill', zipEntry }
 */
function collectDocEntries(zip) {
  const results = [];

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    if (entry.entryName.includes('__MACOSX')) continue;

    const fileName = basename(entry.entryName);
    if (fileName === 'DOC.md') {
      results.push({ entryPath: entry.entryName, type: 'doc', zipEntry: entry });
    } else if (fileName === 'SKILL.md') {
      results.push({ entryPath: entry.entryPath, type: 'skill', zipEntry: entry });
    }
  }

  return results;
}

/**
 * Extract metadata from a DOC.md/SKILL.md file's path within the zip.
 * Detects whether the zip uses standard content structure or flat layout.
 *
 * Standard structure: <author>/docs/<name>/[<language>/]DOC.md
 * Flat structure: DOC.md at arbitrary depth
 *
 * Returns { author, name, language, isStandardStructure }
 */
function extractPathMetadata(entryPath, type) {
  const parts = entryPath.replace(/\\/g, '/').split('/').filter(Boolean);

  // Standard structure: <author>/docs/<name>/DOC.md or <author>/docs/<name>/<language>/DOC.md
  // Or: <author>/skills/<name>/SKILL.md
  const typeDir = type === 'skill' ? 'skills' : 'docs';

  if (parts.length >= 4 && parts[1] === typeDir) {
    const author = parts[0];
    const name = parts[2];
    let language = '';

    if (parts.length >= 5) {
      // Check if the extra segment looks like a language directory
      const potentialLang = parts[3];
      if (potentialLang !== 'references' && potentialLang !== 'examples' && !potentialLang.endsWith('.md')) {
        language = potentialLang;
      }
    }

    if (author && name && /^[a-z0-9-]+$/.test(author) && /^[a-z0-9-]+$/.test(name)) {
      return { author, name, language, isStandardStructure: true };
    }
  }

  // Flat structure — metadata must come from frontmatter or AI
  return { author: '', name: '', language: '', isStandardStructure: false };
}

/**
 * Process a single document entry from the zip.
 */
async function processEntry(docEntry, zip, defaultAuthor, defaultSource, useAi, contentDir) {
  const { entryPath, type, zipEntry } = docEntry;

  // Read file content from zip
  const content = zipEntry.getData().toString('utf8');
  const { attributes: existingMeta, body: markdownBody } = parseFrontmatter(content);

  // Extract path metadata
  const pathMeta = extractPathMetadata(entryPath, type);

  // Build metadata: frontmatter > path > defaults
  let author = existingMeta.name ? (pathMeta.author || defaultAuthor) : (pathMeta.author || defaultAuthor);
  let name = existingMeta.name || pathMeta.name || '';
  let description = existingMeta.description || '';
  let language = existingMeta.metadata?.languages || pathMeta.language || '';
  let version = existingMeta.metadata?.versions || '1.0.0';
  let source = existingMeta.metadata?.source || defaultSource;
  let tags = existingMeta.metadata?.tags || '';
  let aiGenerated = false;

  // Check if we need AI to fill in missing fields
  const needsAi = useAi && (!name || !description);
  if (needsAi) {
    try {
      console.log(`[batch-import] AI generating frontmatter for: ${entryPath}`);
      const aiMeta = await aiGenerateFrontmatter(content);
      if (!name) name = aiMeta.name;
      if (!description) description = aiMeta.description;
      if (!language && aiMeta.language) language = aiMeta.language;
      if (!tags && aiMeta.tags) tags = aiMeta.tags;
      aiGenerated = true;
      console.log(`[batch-import] AI result for ${entryPath}: name=${name}`);
    } catch (err) {
      console.warn(`[batch-import] AI failed for ${entryPath}: ${err.message}`);
    }
  }

  // Validate required fields
  if (!name) {
    return { file: entryPath, error: 'Cannot determine document name (no frontmatter and AI unavailable or failed)' };
  }

  // Normalize author
  if (!author) author = defaultAuthor;
  if (!/^[a-z0-9-]+$/.test(author) || !/^[a-z0-9-]+$/.test(name)) {
    return { file: entryPath, error: `Invalid author or name: author="${author}", name="${name}"` };
  }

  // Determine target path
  const targetPath = resolveTargetPath(contentDir, { author, name, language: language || '' });
  const targetDir = join(targetPath, '..');

  // Check if file already exists
  if (existsSync(targetPath)) {
    return { file: entryPath, skipped: true, reason: 'Document already exists', path: targetPath };
  }

  // Create directory and write file
  mkdirSync(targetDir, { recursive: true });

  const formData = {
    name,
    description: description || `Documentation for ${name}`,
    language,
    version,
    source,
    tags,
  };

  const frontmatter = generateFrontmatter(formData);
  const finalContent = frontmatter + '\n' + markdownBody.trim() + '\n';

  writeFileSync(targetPath, finalContent, 'utf8');

  const relativePath = targetPath.replace(process.cwd() + '/', '');

  return {
    file: entryPath,
    path: relativePath,
    id: `${author}/${name}`,
    type,
    aiGenerated,
  };
}

/**
 * Handle batch import request (zip upload).
 */
export async function handleBatchImport(req, res) {
  let tempDir = null;

  try {
    // Validate
    if (!req.file) {
      return res.status(400).json({ status: 'error', error: 'No file uploaded' });
    }

    if (!req.file.originalname.endsWith('.zip')) {
      return res.status(400).json({ status: 'error', error: 'File must be a .zip archive' });
    }

    const defaultAuthor = req.body.defaultAuthor;
    if (!defaultAuthor || !/^[a-z0-9-]+$/.test(defaultAuthor)) {
      return res.status(400).json({ status: 'error', error: 'defaultAuthor is required and must be lowercase alphanumeric with hyphens' });
    }

    const defaultSource = req.body.source || 'community';
    const useAi = req.body.useAi !== 'false';

    if (useAi && !isAiAvailable()) {
      return res.status(400).json({
        status: 'error',
        error: 'AI service not configured. Set OPENAI_API_KEY environment variable or disable AI with useAi=false.',
      });
    }

    const contentDir = resolve(process.cwd(), 'content');

    // Parse zip
    let zip;
    try {
      zip = new AdmZip(req.file.buffer);
    } catch (err) {
      return res.status(400).json({ status: 'error', error: `Invalid zip file: ${err.message}` });
    }

    // Collect DOC.md / SKILL.md entries
    const docEntries = collectDocEntries(zip);

    if (docEntries.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'No DOC.md or SKILL.md files found in the zip archive.',
      });
    }

    // Process each entry
    const results = [];
    const errors = [];

    for (const docEntry of docEntries) {
      try {
        const result = await processEntry(docEntry, zip, defaultAuthor, defaultSource, useAi, contentDir);

        if (result.error) {
          errors.push(result);
        } else if (result.skipped) {
          errors.push(result);
        } else {
          results.push(result);
        }
      } catch (err) {
        errors.push({ file: docEntry.entryPath, error: err.message });
      }
    }

    const imported = results.length;
    const skipped = errors.filter(e => e.skipped).length;
    const failed = errors.filter(e => !e.skipped).length;

    res.json({
      status: 'success',
      total: docEntries.length,
      imported,
      skipped,
      failed,
      results,
      errors: errors.map(e => ({ file: e.file, error: e.error || e.reason })),
    });
  } catch (err) {
    console.error('[batch-import] Error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  } finally {
    // Cleanup temp dir if created
    if (tempDir) {
      try { rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }
  }
}
