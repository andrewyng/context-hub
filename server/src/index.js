#!/usr/bin/env node

/**
 * Context Hub Server — HTTP API + MCP SSE + Web Console.
 *
 * This is the entry point for the self-hosted server.  It imports upstream
 * cli/ modules exclusively through the adapter layer, keeping the codebase
 * fully isolated from upstream source changes.
 */

import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ensureRegistry } from './adapter.js';
import { createApiRouter } from './rest/router.js';
import { mountMcp } from './mcp/sse-server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// CLI args (minimal — no commander dependency needed)
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function flag(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}
const PORT = parseInt(flag('port', '3000'), 10);
const HOST = flag('host', 'localhost');

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  const start = Date.now();
  _res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.url} ${_res.statusCode} ${ms}ms`);
  });
  next();
});

// Health check (before static files so SPA fallback doesn't intercept it)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REST API
app.use('/api/v1', createApiRouter());

// MCP SSE endpoints
mountMcp(app);

// Static files for web console (production build)
const webDistDir = join(__dirname, 'web');
if (existsSync(webDistDir) && existsSync(join(webDistDir, 'index.html'))) {
  app.use(express.static(webDistDir));
  // SPA fallback — let React Router handle client-side routes
  app.get(/^\/(?!api|mcp|sse|messages|health).*/, (_req, res) => {
    res.sendFile(join(webDistDir, 'index.html'));
  });
}

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[server]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function start() {
  console.log('[server] Initializing registry...');
  try {
    await ensureRegistry();
    console.log('[server] Registry loaded.');
  } catch (err) {
    console.warn(`[server] Warning: registry not loaded: ${err.message}`);
  }

  app.listen(PORT, HOST, () => {
    const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
    console.log(`[server] Context Hub Server listening on http://${HOST}:${PORT}`);
    console.log(`[server] REST API     → http://${displayHost}:${PORT}/api/v1`);
    console.log(`[server] MCP SSE      → http://${displayHost}:${PORT}/sse`);
    console.log(`[server] Web Console  → http://${displayHost}:${PORT}/`);
  });
}

start();
