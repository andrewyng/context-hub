import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml } from 'yaml';

const DEFAULT_CDN_URL = 'https://cdn.aichub.org/v1';
const DEFAULT_TELEMETRY_URL = 'https://api.aichub.org/v1';

const DEFAULTS = {
  output_dir: '.context',
  refresh_interval: 21600,
  output_format: 'human',
  source: 'official,maintainer,community',
  telemetry: true,
  feedback: true,
  telemetry_url: DEFAULT_TELEMETRY_URL,
};

let _config = null;

export function getChubDir() {
  return process.env.CHUB_DIR || join(homedir(), '.chub');
}

export function loadConfig() {
  if (_config) return _config;

  let fileConfig = {};
  const configPath = join(getChubDir(), 'config.yaml');
  try {
    const raw = readFileSync(configPath, 'utf8');
    fileConfig = parseYaml(raw) || {};
  } catch {
    // No config file, use defaults
  }

  // Build sources list
  let sources;
  if (fileConfig.sources && Array.isArray(fileConfig.sources)) {
    sources = fileConfig.sources;
  } else {
    // Backward compat: single cdn_url becomes a single source
    const url = process.env.CHUB_BUNDLE_URL || fileConfig.cdn_url || DEFAULT_CDN_URL;
    sources = [{ name: 'default', url }];
  }

  _config = {
    sources,
    output_dir: fileConfig.output_dir || DEFAULTS.output_dir,
    refresh_interval: fileConfig.refresh_interval ?? DEFAULTS.refresh_interval,
    output_format: fileConfig.output_format || DEFAULTS.output_format,
    source: fileConfig.source || DEFAULTS.source,
    telemetry: fileConfig.telemetry !== undefined ? fileConfig.telemetry : DEFAULTS.telemetry,
    feedback: fileConfig.feedback !== undefined ? fileConfig.feedback : DEFAULTS.feedback,
    telemetry_url: fileConfig.telemetry_url || DEFAULTS.telemetry_url,
  };

  return _config;
}
