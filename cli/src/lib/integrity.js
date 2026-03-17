import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getChubDir } from './config.js';

/**
 * Compute SHA-256 hash of content.
 */
export function computeHash(content) {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Verify content against expected hash.
 * Returns true if valid, throws if invalid.
 */
export function verifyHash(content, expectedHash, context = 'content') {
  const actualHash = computeHash(content);
  if (actualHash !== expectedHash) {
    throw new Error(
      `Content integrity check failed for ${context}. ` +
      `Expected SHA-256: ${expectedHash}, got: ${actualHash}. ` +
      `This may indicate a compromised CDN or man-in-the-middle attack.`
    );
  }
  return true;
}

/**
 * Path to manifest.json for a source.
 * Manifest contains SHA-256 hashes for all files.
 */
function getManifestPath(sourceName) {
  return join(getChubDir(), 'sources', sourceName, 'manifest.json');
}

/**
 * Load manifest for a source, or return null if not found.
 */
export function loadManifest(sourceName) {
  const path = getManifestPath(sourceName);
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Save manifest for a source.
 */
export function saveManifest(sourceName, manifest) {
  const dir = join(getChubDir(), 'sources', sourceName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(getManifestPath(sourceName), JSON.stringify(manifest, null, 2));
}

/**
 * Check if a source has integrity verification enabled.
 * Sources with a manifest.json have verification enabled.
 */
export function hasIntegrityVerification(sourceName) {
  return existsSync(getManifestPath(sourceName));
}

/**
 * Verify registry.json against manifest if available.
 */
export function verifyRegistry(sourceName, content) {
  const manifest = loadManifest(sourceName);
  if (!manifest) {
    // No manifest available - cannot verify
    return { verified: false, reason: 'No manifest available' };
  }

  const expectedHash = manifest.files?.['registry.json'];
  if (expectedHash) {
    verifyHash(content, expectedHash, `${sourceName}/registry.json`);
    return { verified: true, method: 'SHA-256' };
  }

  return { verified: false, reason: 'No hash in manifest' };
}

/**
 * Verify a doc file against manifest if available.
 */
export function verifyDoc(sourceName, docPath, content) {
  const manifest = loadManifest(sourceName);
  if (!manifest) {
    return { verified: false, reason: 'No manifest available' };
  }

  const expectedHash = manifest.files?.[docPath];
  if (expectedHash) {
    verifyHash(content, expectedHash, `${sourceName}/${docPath}`);
    return { verified: true, method: 'SHA-256' };
  }

  return { verified: false, reason: 'No hash in manifest' };
}

/**
 * Verify bundle.tar.gz against manifest before extraction.
 */
export function verifyBundle(sourceName, bundleContent) {
  const manifest = loadManifest(sourceName);
  if (!manifest) {
    return { verified: false, reason: 'No manifest available' };
  }

  const expectedHash = manifest.files?.['bundle.tar.gz'];
  if (expectedHash) {
    verifyHash(bundleContent, expectedHash, `${sourceName}/bundle.tar.gz`);
    return { verified: true, method: 'SHA-256' };
  }

  return { verified: false, reason: 'No hash in manifest' };
}

/**
 * Generate manifest entries for content.
 * Useful for source maintainers to create manifests.
 */
export function generateManifestEntries(files) {
  const entries = {};
  for (const [path, content] of Object.entries(files)) {
    entries[path] = typeof content === 'string' ? computeHash(content) : computeHash(JSON.stringify(content));
  }
  return entries;
}

export default {
  computeHash,
  verifyHash,
  loadManifest,
  saveManifest,
  hasIntegrityVerification,
  verifyRegistry,
  verifyDoc,
  verifyBundle,
  generateManifestEntries,
};
