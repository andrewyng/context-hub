import { readFileSync, writeFileSync, mkdirSync, unlinkSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { getChubDir } from './config.js';

function getAnnotationsDir() {
  return join(getChubDir(), 'annotations');
}

function annotationPath(entryId) {
  const safe = entryId.split('/').map((part) =>
    encodeURIComponent(part).replace(/-/g, '%2D')
  ).join('--');
  const legacy = entryId.replace(/\//g, '--');
  const dir = safe === legacy ? getAnnotationsDir() : join(getAnnotationsDir(), 'v2');
  return join(dir, `${safe}.json`);
}

function legacyAnnotationPath(entryId) {
  return join(getAnnotationsDir(), `${entryId.replace(/\//g, '--')}.json`);
}

function readAnnotationFile(path, entryId) {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return data.id === entryId ? data : null;
  } catch {
    return null;
  }
}

export function readAnnotation(entryId) {
  return readAnnotationFile(annotationPath(entryId), entryId)
    || readAnnotationFile(legacyAnnotationPath(entryId), entryId);
}

export function writeAnnotation(entryId, note) {
  mkdirSync(dirname(annotationPath(entryId)), { recursive: true });
  const data = {
    id: entryId,
    note,
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(annotationPath(entryId), JSON.stringify(data, null, 2));
  const legacy = legacyAnnotationPath(entryId);
  if (legacy !== annotationPath(entryId) && readAnnotationFile(legacy, entryId)) {
    try { unlinkSync(legacy); } catch { /* Keep the saved annotation if cleanup fails. */ }
  }
  return data;
}

export function clearAnnotation(entryId) {
  let removed = false;
  for (const path of new Set([annotationPath(entryId), legacyAnnotationPath(entryId)])) {
    if (!readAnnotationFile(path, entryId)) continue;
    try {
      unlinkSync(path);
      removed = true;
    } catch { /* Missing/unwritable annotations are non-fatal. */ }
  }
  return removed;
}

export function listAnnotations() {
  const dir = getAnnotationsDir();
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f));
    try {
      const v2 = join(dir, 'v2');
      files.push(...readdirSync(v2).filter((f) => f.endsWith('.json')).map((f) => join(v2, f)));
    } catch { /* No versioned annotations yet. */ }
    return files.map((f) => {
      try {
        return JSON.parse(readFileSync(f, 'utf8'));
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch {
    return [];
  }
}
