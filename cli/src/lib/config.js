import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml } from 'yaml';

const DEFAULT_CDN_URL = 'https://cdn.aichub.org/v1';
const DEFAULT_TELEMETRY_URL = 'https://api.aichub.org/v1';
const DEFAULT_HELP_TIMEOUT_MS = 2000;

const DEFAULTS = {
  output_dir: '.context',
  refresh_interval: 21600,
  output_format: 'human',
  source: 'official,maintainer,community',
  telemetry: true,
  feedback: true,
  telemetry_url: DEFAULT_TELEMETRY_URL,
  help_timeout_ms: DEFAULT_HELP_TIMEOUT_MS,
};

let _config = null;

export function getChubDir() {
  return process.env.CHUB_DIR || join(homedir(), '.chub');
}

function getHelpUrlFromSources(sources) {
  const remoteSource = sources.find((source) => typeof source?.url === 'string' && source.url.trim());
  if (!remoteSource) return null;
  return `${remoteSource.url.trim().replace(/\/+$/, '')}/help/{version}.json`;
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
    help_url: process.env.CHUB_HELP_URL
      ?? (fileConfig.help_url !== undefined ? fileConfig.help_url : getHelpUrlFromSources(sources)),
    help_timeout_ms: Number.parseInt(
      process.env.CHUB_HELP_TIMEOUT_MS
      ?? (fileConfig.help_timeout_ms ?? DEFAULTS.help_timeout_ms),
      10
    ) || DEFAULTS.help_timeout_ms,
  };

  return _config;
}
