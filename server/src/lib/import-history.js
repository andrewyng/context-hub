import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { repoPath } from './paths.js';
import { getAiConfig } from './ai-client.js';

const HISTORY_PATH = repoPath('import-history.json');
const MAX_RECORDS = 200;

function loadHistoryFile() {
  try {
    if (!existsSync(HISTORY_PATH)) return { imports: [] };
    const raw = readFileSync(HISTORY_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.imports)) return { imports: [] };
    return { imports: parsed.imports };
  } catch (err) {
    console.warn(`[import-history] Failed to load history: ${err.message}`);
    return { imports: [] };
  }
}

function saveHistoryFile(data) {
  try {
    writeFileSync(HISTORY_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  } catch (err) {
    console.warn(`[import-history] Failed to save history: ${err.message}`);
  }
}

function buildHistoryId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `import-${stamp}-${random}`;
}

export function createImportHistoryRecord(partial = {}) {
  const ai = getAiConfig();
  return {
    id: partial.id || buildHistoryId(),
    timestamp: partial.timestamp || new Date().toISOString(),
    mode: partial.mode || 'batch',
    status: partial.status || 'success',
    request: partial.request || {},
    summary: partial.summary || {},
    results: partial.results || [],
    errors: partial.errors || [],
    diagnostics: {
      aiAvailable: ai.configured,
      aiUsed: false,
      model: ai.model,
      ...(partial.diagnostics || {}),
    },
  };
}

export function appendImportHistory(record) {
  const data = loadHistoryFile();
  data.imports.unshift(record);
  if (data.imports.length > MAX_RECORDS) {
    data.imports = data.imports.slice(0, MAX_RECORDS);
  }
  saveHistoryFile(data);
  return record;
}

export function listImportHistory({ limit = 20, mode, status } = {}) {
  const data = loadHistoryFile();
  let imports = data.imports;
  if (mode) imports = imports.filter(item => item.mode === mode);
  if (status) imports = imports.filter(item => item.status === status);
  return imports.slice(0, limit).map(item => ({
    id: item.id,
    timestamp: item.timestamp,
    mode: item.mode,
    status: item.status,
    request: item.request,
    summary: item.summary,
    diagnostics: item.diagnostics,
  }));
}

export function getImportHistory(id) {
  const data = loadHistoryFile();
  return data.imports.find(item => item.id === id) || null;
}
