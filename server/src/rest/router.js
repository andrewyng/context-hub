/**
 * REST API router — mounts all /api/v1 endpoints.
 */

import { Router } from 'express';
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

  return router;
}
