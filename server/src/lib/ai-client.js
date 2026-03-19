/**
 * AI client for generating document frontmatter.
 * Uses OpenAI-compatible API (supports OpenAI, DeepSeek, custom endpoints).
 *
 * Configuration is loaded from server-config.json at startup, with process.env
 * as fallback. Can be updated at runtime via API and persisted to disk.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { repoPath } from './paths.js';

const CONFIG_PATH = repoPath('server-config.json');

// In-memory config — populated on first load
let _config = null;

function loadConfigFile() {
  if (_config) return _config;
  try {
    if (existsSync(CONFIG_PATH)) {
      const raw = readFileSync(CONFIG_PATH, 'utf8');
      _config = JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[ai-client] Failed to load config: ${err.message}`);
  }
  _config = _config || {};
  _config.ai = _config.ai || {};
  return _config;
}

function getConfig() {
  return loadConfigFile();
}

/**
 * Get AI configuration values, with process.env fallback.
 */
function getAiValues() {
  const cfg = getConfig();
  return {
    apiKey: cfg.ai.apiKey || process.env.OPENAI_API_KEY || '',
    baseUrl: cfg.ai.baseUrl || process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    model: cfg.ai.model || process.env.AI_MODEL || 'gpt-4o-mini',
  };
}

export function isAiAvailable() {
  return !!getAiValues().apiKey;
}

/**
 * Get AI config for display (API key masked).
 */
export function getAiConfig() {
  const vals = getAiValues();
  return {
    baseUrl: vals.baseUrl,
    apiKey: maskApiKey(vals.apiKey),
    model: vals.model,
    configured: !!vals.apiKey,
  };
}

/**
 * Mask API key for safe display: sk-****abcd
 */
function maskApiKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '****';
  return key.slice(0, 3) + '****' + key.slice(-4);
}

/**
 * Update AI configuration at runtime and persist to disk.
 */
export function updateAiConfig({ baseUrl, apiKey, model }) {
  const cfg = getConfig();
  if (baseUrl !== undefined) cfg.ai.baseUrl = baseUrl;
  if (apiKey !== undefined) cfg.ai.apiKey = apiKey;
  if (model !== undefined) cfg.ai.model = model;

  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
    _config = cfg;
    return true;
  } catch (err) {
    console.error(`[ai-client] Failed to save config: ${err.message}`);
    return false;
  }
}

/**
 * Test AI connection with a simple request.
 */
export async function testAiConnection() {
  const { apiKey, baseUrl, model } = getAiValues();
  if (!apiKey) return { success: false, error: 'API Key not configured' };

  // Validate base URL format
  try {
    new URL(baseUrl);
  } catch {
    return { success: false, error: 'Invalid Base URL format' };
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
        temperature: 0,
        max_tokens: 10,
      }),
    });

    // Check content type before parsing
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      const body = await res.text();
      // If response is HTML, provide a cleaner error
      if (body.includes('<!DOCTYPE') || body.includes('<html')) {
        return {
          success: false,
          error: `API returned HTML (status ${res.status}). Check if Base URL is correct. Expected: ${baseUrl}/chat/completions`,
        };
      }
      return { success: false, error: `API returned ${res.status}: ${body.slice(0, 200)}` };
    }

    if (!isJson) {
      const body = await res.text();
      return {
        success: false,
        error: `API returned non-JSON response (${contentType}). Check if Base URL is correct.`,
      };
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    return { success: true, reply };
  } catch (err) {
    // Provide more helpful error messages
    if (err.message.includes('fetch failed') || err.code === 'ECONNREFUSED') {
      return { success: false, error: `Cannot connect to ${baseUrl}. Check if the URL is correct and accessible.` };
    }
    if (err.message.includes('Invalid URL')) {
      return { success: false, error: `Invalid Base URL: ${baseUrl}` };
    }
    return { success: false, error: `Connection failed: ${err.message}` };
  }
}

/**
 * Generate frontmatter fields for a markdown document by analyzing its content.
 * Returns { name, description, language, tags } or null on failure.
 */
async function completeJsonPrompt(prompt, maxTokens = 300) {
  const { apiKey, baseUrl, model } = getAiValues();

  if (!apiKey) {
    throw new Error('AI service not configured. Set API Key in Settings or OPENAI_API_KEY env.');
  }

  const requestVariants = [
    {
      model,
      messages: [
        { role: 'system', content: 'You are a documentation import assistant. Return only valid JSON, no markdown, no explanation.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    },
    {
      model,
      messages: [
        { role: 'system', content: 'You are a documentation import assistant. Return only valid JSON, no markdown, no explanation.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    },
  ];

  let lastError = null;
  for (const payload of requestVariants) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[ai-client] API error ${res.status}: ${errBody}`);
      lastError = new Error(`AI API returned ${res.status}`);
      if (res.status === 400) continue;
      throw lastError;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      lastError = new Error('Empty response from AI');
      continue;
    }

    let jsonStr = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    return JSON.parse(jsonStr);
  }

  throw lastError || new Error('AI API request failed');
}

export async function generateFrontmatter(content) {
  const truncated = content.length > 3000 ? content.slice(0, 3000) + '\n... (truncated)' : content;

  const prompt = `Analyze the following markdown document and generate metadata for a documentation registry.

Return ONLY a JSON object with these fields:
- "name": a short lowercase identifier using hyphens
- "description": a concise one-sentence description for search results
- "language": the primary programming language shown in code examples, or "text" if language-agnostic
- "tags": comma-separated relevant tags for search filtering (3-5 tags)

Document content:
${truncated}`;

  try {
    const result = await completeJsonPrompt(prompt, 300);
    return {
      name: String(result.name || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      description: String(result.description || ''),
      language: String(result.language || 'text'),
      tags: String(result.tags || ''),
    };
  } catch (err) {
    console.error('[ai-client] generateFrontmatter failed:', err.message);
    throw err;
  }
}

export async function planBatchImport(files) {
  const summarizedFiles = files.map(file => ({
    path: file.path,
    originalPath: file.originalPath,
    title: file.title,
    entryType: file.entryType,
    kindHint: file.kindHint,
    classificationReason: file.classificationReason,
    classificationConfidence: file.classificationConfidence,
    languageHint: file.languageHint,
    excerpt: file.excerpt,
  }));

  const prompt = `You are planning how to import a set of markdown files into a strict context-hub registry.

Return ONLY a JSON object in this exact shape:
{
  "entries": [
    {
      "type": "doc",
      "author": "lowercase-author",
      "name": "lowercase-entry-name",
      "description": "one sentence",
      "source": "community",
      "language": "java",
      "version": "1.0.0",
      "mainFile": "original/path.md",
      "supportFiles": [
        { "path": "original/ref1.md", "role": "reference" },
        { "path": "original/example1.md", "role": "example" }
      ]
    },
    {
      "type": "skill",
      "author": "lowercase-author",
      "name": "lowercase-entry-name",
      "description": "one sentence",
      "source": "community",
      "mainFile": "original/path.md",
      "supportFiles": [
        { "path": "original/ref1.md", "role": "reference" }
      ]
    }
  ]
}

Rules:
- Preserve original content. You are only planning structure and metadata.
- Never rewrite, split, merge, or paraphrase markdown body content.
- Files with entryType "skill" and classificationConfidence "high" must stay skills.
- Files with entryType "doc" and classificationConfidence "high" must stay docs.
- Files with entryType null are supporting files unless there is very strong filename evidence they are the main entry.
- Treat archive paths as normalized POSIX-style paths using `/`, even if original zip paths used backslashes.
- sdk in the title is not enough by itself to force a doc classification.
- Task-routing, troubleshooting, workflow, trigger, or operational playbook style main files should prefer skill over doc.
- Prefer as few coherent entries as possible, but do not turn references/examples into standalone docs just because they contain useful text.
- Put supporting material into supportFiles with role "reference" or "example".
- Every entry must have exactly one mainFile.
- For doc entries, language must be non-empty; use "text" if unknown.
- For doc entries, version must be "1.0.0" if unknown.
- Skill entries must NOT include language or version fields.
- Prefer reusing path semantics from the original filenames and directories.
- If the caller already provided an author, keep that author; do not replace it with "imported".
- Only use "imported" as author when no author can be inferred and no caller author was supplied.

Files:
${JSON.stringify(summarizedFiles, null, 2)}`;

  try {
    const result = await completeJsonPrompt(prompt, 1600);
    return result;
  } catch (err) {
    console.error('[ai-client] planBatchImport failed:', err.message);
    throw err;
  }
}
