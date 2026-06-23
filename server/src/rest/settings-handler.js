/**
 * Settings API handlers.
 */

import { getAiConfig, updateAiConfig, testAiConnection } from '../lib/ai-client.js';

/**
 * GET /api/v1/settings/ai — Get AI config (API key masked)
 */
export function handleGetAiSettings(req, res) {
  try {
    const config = getAiConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * PUT /api/v1/settings/ai — Update AI config
 */
export function handleUpdateAiSettings(req, res) {
  try {
    const { baseUrl, apiKey, model } = req.body;

    if (apiKey !== undefined && typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'apiKey must be a string' });
    }
    if (baseUrl !== undefined && typeof baseUrl !== 'string') {
      return res.status(400).json({ error: 'baseUrl must be a string' });
    }
    if (model !== undefined && typeof model !== 'string') {
      return res.status(400).json({ error: 'model must be a string' });
    }

    const ok = updateAiConfig({ baseUrl, apiKey, model });
    if (!ok) {
      return res.status(500).json({ error: 'Failed to save configuration' });
    }

    res.json({ status: 'success', config: getAiConfig() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/v1/settings/ai/test — Test AI connection
 */
export async function handleTestAiConnection(req, res) {
  try {
    // If body contains config values, apply them temporarily for testing
    const { baseUrl, apiKey, model } = req.body || {};
    if (baseUrl || apiKey || model) {
      updateAiConfig({ baseUrl, apiKey, model });
    }

    const result = await testAiConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
