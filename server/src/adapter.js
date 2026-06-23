/**
 * Adapter layer — the single point of contact with upstream cli/ code.
 *
 * Every import from cli/src/ is funnelled through this file so that the rest
 * of the server package never references upstream paths directly.  When the
 * upstream public API changes after a git pull, only this file needs updating.
 */

import {
  searchEntries,
  getEntry,
  listEntries,
  resolveDocPath,
  resolveEntryFile,
  isMultiSource,
  getDisplayId,
  resetRegistry,
} from '../../cli/src/lib/registry.js';

import {
  fetchDoc,
  fetchDocFull,
  ensureRegistry,
  loadSourceRegistry,
  loadSearchIndex,
  getCacheStats,
  clearCache,
  fetchAllRegistries,
} from '../../cli/src/lib/cache.js';

import {
  loadConfig,
  getChubDir,
} from '../../cli/src/lib/config.js';

import {
  handleSearch,
  handleGet,
  handleList,
  handleAnnotate,
  handleFeedback,
} from '../../cli/src/mcp/tools.js';

export {
  searchEntries,
  getEntry,
  listEntries,
  resolveDocPath,
  resolveEntryFile,
  isMultiSource,
  getDisplayId,
  resetRegistry,

  fetchDoc,
  fetchDocFull,
  ensureRegistry,
  loadSourceRegistry,
  loadSearchIndex,
  getCacheStats,
  clearCache,
  fetchAllRegistries,

  loadConfig,
  getChubDir,

  handleSearch,
  handleGet,
  handleList,
  handleAnnotate,
  handleFeedback,
};

// ---------------------------------------------------------------------------
// Extensions — functionality that upstream does not provide
// ---------------------------------------------------------------------------

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Build a recursive tree representation of a content directory.
 * Returns a nested structure suitable for rendering in a tree-view UI.
 */
export function buildContentTree(rootDir) {
  if (!existsSync(rootDir)) return [];

  function walk(dir) {
    const entries = readdirSync(dir, { withFileTypes: true })
      .filter(e => !e.name.startsWith('.'))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

    return entries.map(entry => {
      const fullPath = join(dir, entry.name);
      const relPath = relative(rootDir, fullPath);

      if (entry.isDirectory()) {
        return {
          name: entry.name,
          path: relPath,
          type: 'directory',
          children: walk(fullPath),
        };
      }

      const stat = statSync(fullPath);
      return {
        name: entry.name,
        path: relPath,
        type: 'file',
        size: stat.size,
        modified: stat.mtime.toISOString(),
      };
    });
  }

  return walk(rootDir);
}
