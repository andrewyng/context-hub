import { describe, it, expect } from 'vitest';
import { getChubDir, loadConfig } from '../../src/lib/config.js';
import { homedir } from 'node:os';
import { join } from 'node:path';

describe('getChubDir', () => {
  it('returns a path ending in .chub', () => {
    const dir = getChubDir();
    expect(dir.endsWith('.chub')).toBe(true);
  });

  it('returns a path under the user home directory', () => {
    const dir = getChubDir();
    expect(dir).toBe(join(homedir(), '.chub'));
  });
});

describe('loadConfig', () => {
  it('returns an object with expected default keys', () => {
    const config = loadConfig();

    expect(config).toHaveProperty('sources');
    expect(config).toHaveProperty('output_dir');
    expect(config).toHaveProperty('refresh_interval');
    expect(config).toHaveProperty('output_format');
    expect(config).toHaveProperty('source');
    expect(config).toHaveProperty('telemetry_url');
    expect(config).toHaveProperty('help_url');
    expect(config).toHaveProperty('help_timeout_ms');
  });

  it('has sensible default values', () => {
    const config = loadConfig();

    expect(config.output_dir).toBe('.context');
    expect(config.refresh_interval).toBe(21600);
    expect(config.output_format).toBe('human');
    expect(config.source).toBe('official,maintainer,community');
    expect(config.telemetry_url).toBe('https://api.aichub.org/v1');
    expect(config.help_url).toBe('https://cdn.aichub.org/v1/help/{version}.json');
    expect(config.help_timeout_ms).toBe(2000);
  });

  it('sources is a non-empty array', () => {
    const config = loadConfig();

    expect(Array.isArray(config.sources)).toBe(true);
    expect(config.sources.length).toBeGreaterThan(0);
  });

  it('each source has a name and url or path', () => {
    const config = loadConfig();

    for (const source of config.sources) {
      expect(source).toHaveProperty('name');
      expect(source.url || source.path).toBeTruthy();
    }
  });
});
