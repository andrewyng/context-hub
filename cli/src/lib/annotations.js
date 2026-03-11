import { readFileSync, writeFileSync, mkdirSync, unlinkSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getChubDir } from './config.js';

function getAnnotationsDir() {
  return join(getChubDir(), 'annotations');
}

function annotationPath(entryId) {
  const safe = entryId.replace(/\//g, '--');
  return join(getAnnotationsDir(), `${safe}.json`);
}

export function readAnnotation(entryId) {
  try {
    return JSON.parse(readFileSync(annotationPath(entryId), 'utf8'));
  } catch {
    return null;
  }
}

export function writeAnnotation(entryId, note, docMeta = {}) {
  const dir = getAnnotationsDir();
  mkdirSync(dir, { recursive: true });
  const data = {
    id: entryId,
    note,
    updatedAt: new Date().toISOString(),
  };
  // Store doc metadata for integrity checking
  if (docMeta.version) data.docVersion = docMeta.version;
  if (docMeta.lastUpdated) data.docLastUpdated = docMeta.lastUpdated;
  writeFileSync(annotationPath(entryId), JSON.stringify(data, null, 2));
  return data;
}

export function clearAnnotation(entryId) {
  try {
    unlinkSync(annotationPath(entryId));
    return true;
  } catch {
    return false;
  }
}

export function listAnnotations() {
  const dir = getAnnotationsDir();
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    return files.map((f) => {
      try {
        return JSON.parse(readFileSync(join(dir, f), 'utf8'));
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Check if an annotation may be stale relative to the current doc metadata.
 * Returns null if no staleness detected, or a warning object if stale.
 */
export function checkAnnotationIntegrity(annotation, currentDocMeta) {
  if (!annotation) return null;

  const warnings = [];

  // Version drift: annotation was made for a different version
  if (annotation.docVersion && currentDocMeta.version && annotation.docVersion !== currentDocMeta.version) {
    warnings.push(`version changed (${annotation.docVersion} → ${currentDocMeta.version})`);
  }

  // Content update: doc was updated after annotation was created
  if (annotation.docLastUpdated && currentDocMeta.lastUpdated && annotation.docLastUpdated !== currentDocMeta.lastUpdated) {
    warnings.push(`doc updated since annotation (${annotation.docLastUpdated} → ${currentDocMeta.lastUpdated})`);
  }

  if (warnings.length === 0) return null;

  return {
    stale: true,
    reasons: warnings,
    message: `This annotation may be outdated: ${warnings.join('; ')}.`,
  };
}
