/**
 * REST API router — mounts all /api/v1 endpoints.
 */

import { Router } from 'express';
import multer from 'multer';
import {
  handleSearchRequest,
  handleListEntries,
  handleGetEntry,
  handleGetContent,
  handleGetRegistry,
  handleGetTree,
  handleGetStats,
  handleBuild,
  handleGetFileByPath,
} from './handlers.js';
import { handleImport } from './import-handler.js';
import { handleBatchImport } from './batch-import-handler.js';
import { handleGetAiSettings, handleUpdateAiSettings, handleTestAiConnection } from './settings-handler.js';
import { getAiConfig } from '../lib/ai-client.js';
import { getImportHistory, listImportHistory } from '../lib/import-history.js';

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (for zip archives)
  },
  fileFilter: (_req, file, cb) => {
    if (file.originalname.endsWith('.md') || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only .md or .zip files are allowed'), false);
    }
  },
});

export function createApiRouter() {
  const router = Router();

  router.get('/search', handleSearchRequest);
  router.get('/entries', handleListEntries);
  router.get('/entries/:author/:name', handleGetEntry);
  router.get('/entries/:author/:name/content', handleGetContent);
  router.get('/registry', handleGetRegistry);
  router.get('/tree', handleGetTree);
  router.get('/file', handleGetFileByPath);
  router.get('/stats', handleGetStats);
  router.post('/build', handleBuild);
  router.post('/import', upload.single('file'), handleImport);
  router.post('/import/batch', upload.single('file'), handleBatchImport);
  router.get('/import/config', (_req, res) => res.json({ ai: getAiConfig() }));
  router.get('/import/history', (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const mode = typeof req.query.mode === 'string' ? req.query.mode : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    res.json({ status: 'success', imports: listImportHistory({ limit, mode, status }) });
  });
  router.get('/import/history/:id', (req, res) => {
    const record = getImportHistory(req.params.id);
    if (!record) {
      return res.status(404).json({ status: 'error', error: 'Import history not found' });
    }
    res.json({ status: 'success', import: record });
  });
  router.get('/settings/ai', handleGetAiSettings);
  router.put('/settings/ai', handleUpdateAiSettings);
  router.post('/settings/ai/test', handleTestAiConnection);

  return router;
}
