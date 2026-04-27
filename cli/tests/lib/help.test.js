import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let tempChubDir = null;

function makeJsonResponse(payload, status = 200, statusText = 'OK') {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: async () => JSON.stringify(payload),
    headers: {
      get(name) {
        return name.toLowerCase() === 'content-type' ? 'application/json' : null;
      },
    },
  };
}

afterEach(() => {
  vi.resetModules();
  delete process.env.CHUB_DIR;
  delete process.env.CHUB_BUNDLE_URL;
  delete process.env.CHUB_HELP_URL;
  delete process.env.CHUB_HELP_TIMEOUT_MS;
  if (tempChubDir) {
    rmSync(tempChubDir, { recursive: true, force: true });
    tempChubDir = null;
  }
});

describe('loadHelpContent', () => {
  it('retrieves the exact help version when available', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_HELP_URL = 'https://cdn.example.test/help/{version}.json';

    const fetchMock = vi.fn(async (url) => {
      expect(url).toBe('https://cdn.example.test/help/0.1.3.json');
      return makeJsonResponse({
        schema_version: 1,
        cli_version: '0.1.3',
        help_revision: '2026-04-01.1',
        content: 'Remote bootstrap help for 0.1.3',
      });
    });

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('remote');
    expect(help.requestedVersion).toBe('0.1.3');
    expect(help.resolvedVersion).toBe('0.1.3');
    expect(help.resolution).toBe('exact');
    expect(help.helpRevision).toBe('2026-04-01.1');
    expect(help.content).toBe('Remote bootstrap help for 0.1.3');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('accepts plain-text remote help responses', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_HELP_URL = 'https://cdn.example.test/help/{version}.md';

    const fetchMock = vi.fn(async (url) => {
      expect(url).toBe('https://cdn.example.test/help/0.1.3.md');
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => 'Remote markdown bootstrap help',
        headers: {
          get(name) {
            return name.toLowerCase() === 'content-type' ? 'text/markdown' : null;
          },
        },
      };
    });

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('remote');
    expect(help.requestedVersion).toBe('0.1.3');
    expect(help.resolvedVersion).toBe('0.1.3');
    expect(help.content).toBe('Remote markdown bootstrap help');
  });

  it('falls back locally when the exact remote help version is unavailable', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_HELP_URL = 'https://cdn.example.test/help/{version}.json';

    const fetchMock = vi.fn(async (url) => {
      expect(url).toBe('https://cdn.example.test/help/0.1.3.json');
      return makeJsonResponse({}, 404, 'Not Found');
    });

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('local');
    expect(help.requestedVersion).toBe('0.1.3');
    expect(help.resolvedVersion).toBe('0.1.3');
    expect(help.resolution).toBe('local');
    expect(help.content).toContain('Getting Started');
    expect(help.content).toContain('Agent Workflow');
    expect(help.fallbackReason).toContain('404 Not Found');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back locally when the remote help payload targets a different version', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_HELP_URL = 'https://cdn.example.test/help/{version}.json';

    const fetchMock = vi.fn(async () => makeJsonResponse({
      schema_version: 1,
      cli_version: '0.2.0',
      help_revision: '2026-04-01.2',
      content: 'Wrong help train',
    }));

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('local');
    expect(help.content).toContain('Getting Started');
    expect(help.content).toContain('Agent Workflow');
    expect(help.fallbackReason).toContain('mismatched help payload version 0.2.0');
  });

  it('falls back locally when a JSON response body is malformed', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_HELP_URL = 'https://cdn.example.test/help/{version}.json';

    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => '{"content":',
      headers: {
        get(name) {
          return name.toLowerCase() === 'content-type' ? 'application/json' : null;
        },
      },
    }));

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('local');
    expect(help.content).toContain('Getting Started');
    expect(help.content).toContain('Agent Workflow');
    expect(help.fallbackReason).toContain('Invalid remote help payload');
  });

  it('falls back locally when a JSON help payload is blank', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_HELP_URL = 'https://cdn.example.test/help/{version}.json';

    const fetchMock = vi.fn(async () => makeJsonResponse({
      schema_version: 1,
      cli_version: '0.1.3',
      help_revision: '2026-04-01.3',
      content: '   ',
    }));

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('local');
    expect(help.content).toContain('Getting Started');
    expect(help.content).toContain('Agent Workflow');
    expect(help.fallbackReason).toContain('Invalid remote help payload');
  });

  it('falls back locally when a JSON help payload omits cli_version', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_HELP_URL = 'https://cdn.example.test/help/{version}.json';

    const fetchMock = vi.fn(async () => makeJsonResponse({
      schema_version: 1,
      help_revision: '2026-04-01.4',
      content: 'Remote bootstrap help without a version',
    }));

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('local');
    expect(help.content).toContain('Getting Started');
    expect(help.content).toContain('Agent Workflow');
    expect(help.fallbackReason).toContain('Invalid remote help payload');
  });

  it('uses bundled local help when remote help is disabled', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_HELP_URL = 'off';

    const fetchMock = vi.fn();

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('local');
    expect(help.url).toBe(null);
    expect(help.content).toContain('npx skills add https://github.com/andrewyng/context-hub --skill get-api-docs');
    expect(help.content).toContain('$(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md');
    expect(help.content).toContain('cli/skills/get-api-docs/SKILL.md');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('derives remote help from CHUB_BUNDLE_URL when no help URL is configured', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    process.env.CHUB_BUNDLE_URL = 'https://mirror.example.test/v1/';

    const fetchMock = vi.fn(async (url) => {
      expect(url).toBe('https://mirror.example.test/v1/help/0.1.3.json');
      return makeJsonResponse({
        schema_version: 1,
        cli_version: '0.1.3',
        content: 'Mirrored help',
      });
    });

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('remote');
    expect(help.content).toBe('Mirrored help');
  });

  it('derives remote help from the configured source URL', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    writeFileSync(join(tempChubDir, 'config.yaml'), [
      'sources:',
      '  - name: mirror',
      '    url: https://mirror.example.test/context',
      '',
    ].join('\n'));

    const fetchMock = vi.fn(async (url) => {
      expect(url).toBe('https://mirror.example.test/context/help/0.1.3.json');
      return makeJsonResponse({
        schema_version: 1,
        cli_version: '0.1.3',
        content: 'Source help',
      });
    });

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('remote');
    expect(help.content).toBe('Source help');
  });

  it('uses bundled local help when only local sources are configured', async () => {
    tempChubDir = mkdtempSync(join(tmpdir(), 'chub-help-test-'));
    process.env.CHUB_DIR = tempChubDir;
    writeFileSync(join(tempChubDir, 'config.yaml'), [
      'sources:',
      '  - name: local',
      '    path: /tmp/context-hub-docs',
      '',
    ].join('\n'));

    const fetchMock = vi.fn();

    const { loadHelpContent } = await import('../../src/lib/help.js');
    const help = await loadHelpContent('0.1.3', { fetchImpl: fetchMock });

    expect(help.source).toBe('local');
    expect(help.url).toBe(null);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('getVersionedHelpPayload', () => {
  it('builds a versioned payload from the bundled local help text', async () => {
    const { getVersionedHelpPayload } = await import('../../src/lib/help.js');
    const payload = getVersionedHelpPayload('0.1.3', {
      helpRevision: 'git-abc1234',
      updatedAt: '2026-04-02T00:00:00Z',
    });

    expect(payload).toEqual({
      schema_version: 1,
      cli_version: '0.1.3',
      help_revision: 'git-abc1234',
      updated_at: '2026-04-02T00:00:00Z',
      content: expect.stringContaining('Getting Started'),
    });
  });
});
