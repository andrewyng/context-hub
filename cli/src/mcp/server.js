/**
 * Context Hub MCP Server.
 *
 * Exposes chub search, get, list, annotate, and feedback as MCP tools
 * for use with Claude Code, Cursor, and other MCP-compatible agents.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ensureRegistry } from '../lib/cache.js';
import { listEntries } from '../lib/registry.js';
import { handleSearch, handleGet, handleList, handleAnnotate, handleFeedback } from './tools.js';
import { attachStdioShutdownHandlers } from './stdio-lifecycle.js';

// Prevent console.log from corrupting the stdio JSON-RPC protocol.
// Any transitive dependency (e.g. posthog-node) that calls console.log
// would break the MCP transport without this redirect.
const _stderr = process.stderr;
console.log = (...args) => _stderr.write(args.join(' ') + '\n');
console.warn = (...args) => _stderr.write('[warn] ' + args.join(' ') + '\n');
console.info = (...args) => _stderr.write('[info] ' + args.join(' ') + '\n');
console.debug = (...args) => _stderr.write('[debug] ' + args.join(' ') + '\n');

// Read package version
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));

// Create server
const server = new McpServer({
  name: 'chub',
  version: pkg.version,
});

// --- Register Tools ---

server.tool(
  'chub_search',
  'Search Context Hub for docs and skills by query, tags, or language',
  {
    query: z.string().optional().describe('Search query. Omit to list all entries.'),
    tags: z.string().optional().describe('Comma-separated tag filter (e.g. "openai,chat")'),
    lang: z.string().optional().describe('Filter by language (e.g. "python", "js")'),
    limit: z.number().int().min(1).max(100).optional().describe('Max results (default 20)'),
  },
  async (args) => handleSearch(args),
);

server.tool(
  'chub_get',
  'Fetch the content of a doc or skill by ID from Context Hub',
  {
    id: z.string().describe('Entry ID (e.g. "openai/chat", "stripe/api"). Use source:id for disambiguation.'),
    lang: z.string().optional().describe('Language variant (e.g. "python", "js"). Auto-selected if only one.'),
    version: z.string().optional().describe('Specific version (e.g. "1.52.0"). Defaults to recommended.'),
    full: z.boolean().optional().describe('Fetch all files, not just the entry point (default false)'),
    file: z.string().optional().describe('Fetch a specific file by path (e.g. "references/streaming.md")'),
  },
  async (args) => handleGet(args),
);

server.tool(
  'chub_list',
  'List all available docs and skills in Context Hub',
  {
    tags: z.string().optional().describe('Comma-separated tag filter'),
    lang: z.string().optional().describe('Filter by language'),
    limit: z.number().int().min(1).max(500).optional().describe('Max entries (default 50)'),
  },
  async (args) => handleList(args),
);

server.tool(
  'chub_annotate',
  'Read, write, clear, or list agent annotations. Modes: (1) list=true to list all, (2) id+note to write, (3) id+clear=true to delete, (4) id alone to read. Annotations persist locally across sessions.',
  {
    id: z.string().optional().describe('Entry ID to annotate (e.g. "openai/chat"). Required unless using list mode.'),
    note: z.string().optional().describe('Annotation text to save. Omit to read existing annotation.'),
    clear: z.boolean().optional().describe('Remove the annotation for this entry (default false)'),
    list: z.boolean().optional().describe('List all annotations (default false). When true, id is not needed.'),
  },
  async (args) => handleAnnotate(args),
);

server.tool(
  'chub_feedback',
  'Send quality feedback (thumbs up/down) for a doc or skill to help authors improve content',
  {
    id: z.string().describe('Entry ID to rate (e.g. "openai/chat")'),
    rating: z.enum(['up', 'down']).describe('Thumbs up or down'),
    comment: z.string().optional().describe('Optional comment explaining the rating'),
    type: z.enum(['doc', 'skill']).optional().describe('Entry type. Auto-detected if omitted.'),
    lang: z.string().optional().describe('Language variant rated'),
    version: z.string().optional().describe('Version rated'),
    file: z.string().optional().describe('Specific file rated'),
    labels: z.array(z.enum([
      'accurate', 'well-structured', 'helpful', 'good-examples',
      'outdated', 'inaccurate', 'incomplete', 'wrong-examples',
      'wrong-version', 'poorly-structured',
    ])).optional().describe('Structured feedback labels'),
  },
  async (args) => handleFeedback(args),
);

// --- Register Resource ---

server.resource(
  'registry',
  'chub://registry',
  {
    title: 'Context Hub Registry',
    description: 'Browse the full Context Hub registry of docs and skills',
    mimeType: 'application/json',
  },
  async (uri) => {
    try {
      const entries = listEntries({});
      const simplified = entries.map((entry) => ({
        id: entry.id,
        name: entry.name,
        type: entry._type || (entry.languages ? 'doc' : 'skill'),
        description: entry.description,
        tags: entry.tags || [],
        ...(entry.languages
          ? {
            languages: entry.languages.map((l) => ({
              language: l.language,
              versions: l.versions?.map((v) => v.version) || [],
              recommended: l.recommendedVersion,
            })),
          }
          : {}),
      }));
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({ entries: simplified, total: simplified.length }, null, 2),
        }],
      };
    } catch (err) {
      console.warn(`Registry resource error: ${err.message}`);
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({ error: 'Registry not loaded. Run "chub update" first.' }),
        }],
      };
    }
  },
);

// --- Process Safety ---

// Prevent the server from crashing on unhandled errors (long-lived process)
process.on('uncaughtException', (err) => {
  _stderr.write(`[chub-mcp] Uncaught exception: ${err.message}\n`);
});
process.on('unhandledRejection', (reason) => {
  _stderr.write(`[chub-mcp] Unhandled rejection: ${reason}\n`);
});

// Exit promptly when MCP host disconnects stdio.
attachStdioShutdownHandlers({ stderr: _stderr });

// --- Start Server ---

// Best-effort registry load — server starts even if this fails
try {
  await ensureRegistry();
} catch (err) {
  _stderr.write(`[chub-mcp] Warning: Registry not loaded: ${err.message}\n`);
}

const transport = new StdioServerTransport();
await server.connect(transport);
_stderr.write(`[chub-mcp] Server started (v${pkg.version})\n`);
