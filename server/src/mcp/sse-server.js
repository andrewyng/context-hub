/**
 * MCP Server over SSE transport.
 *
 * Re-creates the same tool registrations as cli/src/mcp/server.js but uses
 * SSEServerTransport so remote agents can connect over HTTP.
 *
 * Handler implementations are imported from upstream via the adapter layer.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import {
  handleSearch,
  handleGet,
  handleList,
  handleAnnotate,
  handleFeedback,
  listEntries,
} from '../adapter.js';

/**
 * Create a fresh McpServer instance with all tools registered.
 * Each SSE connection gets its own server instance so sessions are isolated.
 */
function createMcpServer() {
  const server = new McpServer({
    name: 'chub-remote',
    version: '0.1.0',
  });

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
      id: z.string().describe('Entry ID (e.g. "openai/chat"). Use source:id for disambiguation.'),
      lang: z.string().optional().describe('Language variant (e.g. "python", "js").'),
      version: z.string().optional().describe('Specific version (e.g. "1.52.0").'),
      full: z.boolean().optional().describe('Fetch all files (default false)'),
      file: z.string().optional().describe('Fetch a specific file by path'),
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
    'Read, write, clear, or list agent annotations',
    {
      id: z.string().optional().describe('Entry ID to annotate'),
      note: z.string().optional().describe('Annotation text to save'),
      clear: z.boolean().optional().describe('Remove the annotation (default false)'),
      list: z.boolean().optional().describe('List all annotations (default false)'),
    },
    async (args) => handleAnnotate(args),
  );

  server.tool(
    'chub_feedback',
    'Send quality feedback (thumbs up/down) for a doc or skill',
    {
      id: z.string().describe('Entry ID to rate'),
      rating: z.enum(['up', 'down']).describe('Thumbs up or down'),
      comment: z.string().optional().describe('Optional comment'),
      type: z.enum(['doc', 'skill']).optional().describe('Entry type'),
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

  server.resource(
    'registry',
    'chub://registry',
    { title: 'Context Hub Registry', description: 'Full registry of docs and skills', mimeType: 'application/json' },
    async (uri) => {
      const entries = listEntries({});
      const simplified = entries.map(entry => ({
        id: entry.id,
        name: entry.name,
        type: entry._type || (entry.languages ? 'doc' : 'skill'),
        description: entry.description,
        tags: entry.tags || [],
        ...(entry.languages ? {
          languages: entry.languages.map(l => ({
            language: l.language,
            versions: l.versions?.map(v => v.version) || [],
            recommended: l.recommendedVersion,
          })),
        } : {}),
      }));
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({ entries: simplified, total: simplified.length }, null, 2),
        }],
      };
    },
  );

  return server;
}

// Active transports keyed by sessionId
const transports = {};

/**
 * Mount MCP SSE endpoints onto an Express app.
 *
 *   GET  /sse       — establish SSE stream
 *   POST /messages  — send JSON-RPC message to a session
 */
export function mountMcp(app) {
  app.get('/sse', async (req, res) => {
    console.log('[mcp] SSE connection request');
    try {
      const transport = new SSEServerTransport('/messages', res);
      const sessionId = transport.sessionId;
      transports[sessionId] = transport;

      transport.onclose = () => {
        console.log(`[mcp] Session closed: ${sessionId}`);
        delete transports[sessionId];
      };

      const server = createMcpServer();
      await server.connect(transport);
      console.log(`[mcp] Session established: ${sessionId}`);
    } catch (err) {
      console.error('[mcp] Error establishing SSE stream:', err);
      if (!res.headersSent) {
        res.status(500).send('Error establishing SSE stream');
      }
    }
  });

  app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId parameter' });
    }
    const transport = transports[sessionId];
    if (!transport) {
      return res.status(404).json({ error: 'Session not found' });
    }
    try {
      await transport.handlePostMessage(req, res, req.body);
    } catch (err) {
      console.error('[mcp] Error handling message:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error handling message' });
      }
    }
  });
}

// Graceful shutdown helper
export function closeAllSessions() {
  for (const sessionId of Object.keys(transports)) {
    try {
      transports[sessionId].close();
      delete transports[sessionId];
    } catch { /* best effort */ }
  }
}
