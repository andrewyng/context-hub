import { loadConfig } from './config.js';

function normalizeHelpUrl(value) {
  if (value === false || value === null) return null;
  if (typeof value !== 'string') return value || null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();
  if (['0', 'false', 'off', 'disabled', 'none', 'local'].includes(normalized)) {
    return null;
  }

  return trimmed;
}

function buildHelpUrl(helpUrlTemplate, requestedVersion) {
  if (helpUrlTemplate.includes('{version}')) {
    return helpUrlTemplate.replaceAll('{version}', requestedVersion);
  }

  try {
    const url = new URL(helpUrlTemplate);
    url.searchParams.set('cli_version', requestedVersion);
    return url.toString();
  } catch {
    return helpUrlTemplate;
  }
}

function parseRemoteHelpPayload(raw, contentType = '') {
  const trimmed = raw.trim();
  const isJsonContentType = contentType.includes('json');
  const looksLikeJson = isJsonContentType || (trimmed.startsWith('{') && trimmed.endsWith('}'));

  if (!looksLikeJson) {
    return { content: raw, contentFormat: 'text' };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    if (isJsonContentType) {
      throw new Error('Invalid remote help payload');
    }
    return { content: raw };
  }

  if (typeof parsed === 'string') {
    return { content: parsed, contentFormat: isJsonContentType ? 'json' : 'text' };
  }

  if (!parsed || typeof parsed.content !== 'string' || parsed.content.trim().length === 0) {
    throw new Error('Invalid remote help payload');
  }

  return {
    content: parsed.content,
    contentFormat: 'json',
    schemaVersion: typeof parsed.schema_version === 'number' ? parsed.schema_version : null,
    cliVersion: typeof parsed.cli_version === 'string' ? parsed.cli_version : null,
    helpRevision: typeof parsed.help_revision === 'string'
      ? parsed.help_revision
      : (typeof parsed.helpRevision === 'string' ? parsed.helpRevision : null),
    updatedAt: typeof parsed.updated_at === 'string'
      ? parsed.updated_at
      : (typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null),
  };
}

export function getLocalHelpText(cliVersion) {
  return [
    `chub — Context Hub CLI v${cliVersion}`,
    'Search and retrieve LLM-optimized docs and skills.',
    '',
    'Getting Started',
    '',
    '  $ chub update                                # download the registry',
    '  $ chub search                                # list everything available',
    '  $ chub search "stripe"                       # fuzzy search',
    '  $ chub search stripe/payments                # exact id -> full detail',
    '  $ chub get stripe/api                        # print doc to terminal',
    '  $ chub get stripe/api -o doc.md              # save to file',
    '  $ chub get openai/chat --lang py             # specific language',
    '  $ chub get pw-community/login-flows          # fetch a skill',
    '  $ chub get openai/chat stripe/api            # fetch multiple',
    '',
    'Agent Workflow',
    '',
    '  Before coding against an external API, SDK, or library:',
    '  1. Find the best entry with `chub search`.',
    '  2. Fetch the exact doc or skill with `chub get`.',
    '  3. Use that content instead of guessing from training data.',
    '  4. Save discovered gaps with `chub annotate`.',
    '  5. Rate docs after use with `chub feedback`.',
    '',
    'Install the agent skill',
    '',
    '  $ npx skills add https://github.com/andrewyng/context-hub --skill get-api-docs',
    '  This installs the `get-api-docs` skill so agents know to use chub before coding against external APIs.',
    '  Manual fallback: copy `$(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md` into your agent\'s skill or rule directory.',
    '  Repository source: `cli/skills/get-api-docs/SKILL.md`.',
    '',
    'Learn & Improve',
    '',
    '  After using a doc, save what you learned so future sessions start smarter:',
    '',
    '  $ chub annotate stripe/api "Webhook needs raw body"   # persists across sessions',
    '  $ chub annotate --list                                 # see all saved notes',
    '  $ chub annotate stripe/api --clear                     # remove a note',
    '',
    '  Always rate docs after using them; this helps authors fix issues and prioritize:',
    '',
    '  $ chub feedback stripe/api up --label accurate "Clear examples"',
    '  $ chub feedback stripe/api down --label outdated "Missing v3 API"',
    '',
    'Commands',
    '',
    '  search [query]              Search docs and skills (no query = list all)',
    '  get <ids...>                Fetch docs or skills by ID',
    '  annotate [id] [note]        Save a note that appears on future fetches',
    '  feedback <id> <up|down>     Rate a doc or skill after using it',
    '  update                      Refresh the cached registry',
    '  cache status|clear          Manage the local cache',
    '  build <content-dir>         Build registry from content directory',
    '',
    'Flags',
    '',
    '  --json                 Structured JSON output for command results',
    '  --tags <csv>           Filter by tags (e.g. docs, skill, openai, browser)',
    '  --lang <language>      Language variant (required for docs): py | js | ts | rb | cs (or full name)',
    '  --full                 Fetch all files, not just the entry point',
    '  -o, --output <path>    Write content to file or directory',
    '',
    'Multi-Source Config (~/.chub/config.yaml)',
    '',
    '  sources:',
    '    - name: community',
    '      url: https://cdn.aichub.org/v1',
    '    - name: internal',
    '      path: /path/to/local/docs',
    '',
    '  # On id collision, use source: prefix: chub get internal:openai/chat',
    '',
    'Feedback Labels',
    '',
    '  Valid labels: accurate, well-structured, helpful, good-examples, outdated, inaccurate, incomplete, wrong-examples, wrong-version, poorly-structured',
  ].join('\n');
}

export function getVersionedHelpPayload(cliVersion, { helpRevision = null, updatedAt = null } = {}) {
  return {
    schema_version: 1,
    cli_version: cliVersion,
    ...(helpRevision ? { help_revision: helpRevision } : {}),
    ...(updatedAt ? { updated_at: updatedAt } : {}),
    content: getLocalHelpText(cliVersion),
  };
}

function buildLocalHelpResponse(cliVersion, { url = null, fallbackReason } = {}) {
  return {
    source: 'local',
    content: getLocalHelpText(cliVersion),
    requestedVersion: cliVersion,
    resolvedVersion: cliVersion,
    resolution: 'local',
    url,
    ...(fallbackReason ? { fallbackReason } : {}),
  };
}

export async function loadHelpContent(cliVersion, { fetchImpl = globalThis.fetch } = {}) {
  const config = loadConfig();
  const helpUrl = normalizeHelpUrl(config.help_url);

  if (!helpUrl || typeof fetchImpl !== 'function') {
    return buildLocalHelpResponse(cliVersion, { url: helpUrl });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.help_timeout_ms || 2000);
  const url = buildHelpUrl(helpUrl, cliVersion);

  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json, text/plain;q=0.9, text/markdown;q=0.8',
      },
    });

    if (!response.ok) {
      return buildLocalHelpResponse(cliVersion, {
        url,
        fallbackReason: `${response.status} ${response.statusText}`.trim(),
      });
    }

    const contentType = response.headers?.get?.('content-type') || '';
    const payload = parseRemoteHelpPayload(await response.text(), contentType);

    if (payload.content.trim().length === 0) {
      return buildLocalHelpResponse(cliVersion, {
        url,
        fallbackReason: 'Invalid remote help payload',
      });
    }

    if (payload.contentFormat === 'json' && !payload.cliVersion) {
      return buildLocalHelpResponse(cliVersion, {
        url,
        fallbackReason: 'Invalid remote help payload',
      });
    }

    if (payload.contentFormat === 'json' && payload.cliVersion !== cliVersion) {
      return buildLocalHelpResponse(cliVersion, {
        url,
        fallbackReason: `mismatched help payload version ${payload.cliVersion}`,
      });
    }

    return {
      source: 'remote',
      content: payload.content,
      requestedVersion: cliVersion,
      resolvedVersion: payload.cliVersion || cliVersion,
      resolution: 'exact',
      helpRevision: payload.helpRevision,
      schemaVersion: payload.schemaVersion,
      updatedAt: payload.updatedAt,
      url,
    };
  } catch (err) {
    return buildLocalHelpResponse(cliVersion, {
      url,
      fallbackReason: err?.name === 'AbortError' ? 'timeout' : (err?.message || 'remote_help_unavailable'),
    });
  } finally {
    clearTimeout(timeout);
  }
}
