import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// server/src/lib -> server/src -> server -> repo root
export const REPO_ROOT = resolve(__dirname, '..', '..', '..');

export function repoPath(...parts) {
  return join(REPO_ROOT, ...parts);
}
