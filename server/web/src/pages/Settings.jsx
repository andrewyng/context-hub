import { useState, useEffect } from 'react';

const styles = {
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: 14,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginBottom: 20,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  formGroupFull: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  hint: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-mono)',
  },
  passwordInput: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-mono)',
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 20,
  },
  primaryBtn: {
    padding: '10px 20px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  secondaryBtn: {
    padding: '10px 20px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  successBox: {
    background: 'rgba(74, 222, 128, 0.06)',
    border: '1px solid rgba(74, 222, 128, 0.2)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    marginTop: 16,
    fontSize: 13,
    color: 'var(--success)',
  },
  errorBox: {
    background: 'rgba(248, 113, 113, 0.06)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    marginTop: 16,
    fontSize: 13,
    color: '#f87171',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  dotOk: {
    background: 'var(--success)',
  },
  dotNo: {
    background: '#f87171',
  },
  testResult: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    marginTop: 16,
    fontSize: 13,
  },
};

const PRESETS = [
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: 'Custom', baseUrl: '', model: '' },
];

export default function Settings() {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [savedApiKeyMasked, setSavedApiKeyMasked] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetch('/api/v1/settings/ai')
      .then(r => r.json())
      .then(data => {
        setBaseUrl(data.baseUrl || '');
        setModel(data.model || '');
        setSavedApiKeyMasked(data.apiKey || '');
      })
      .catch(() => {});
  }, []);

  function handlePreset(preset) {
    if (preset.baseUrl) setBaseUrl(preset.baseUrl);
    if (preset.model) setModel(preset.model);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setTestResult(null);

    try {
      const body = {};
      body.baseUrl = baseUrl;
      body.model = model;
      // Only send apiKey if user typed something new (not the masked value)
      if (apiKey && apiKey !== savedApiKeyMasked) {
        body.apiKey = apiKey;
      }

      const res = await fetch('/api/v1/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
        return;
      }

      setSavedApiKeyMasked(data.config.apiKey || '');
      setApiKey('');
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);

    try {
      // Send current form values for testing (even if not saved yet)
      const body = { baseUrl, model };
      if (apiKey && apiKey !== savedApiKeyMasked) {
        body.apiKey = apiKey;
      }

      const res = await fetch('/api/v1/settings/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  }

  const configured = !!savedApiKeyMasked;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Configure AI model and server settings</p>
      </div>

      {/* AI Configuration */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>AI Model Configuration</h2>
        <p style={styles.cardDesc}>
          Configure the AI model used for auto-generating document frontmatter during batch import.
          Supports OpenAI-compatible APIs.
        </p>

        <div style={styles.statusRow}>
          <span style={{ ...styles.dot, ...(configured ? styles.dotOk : styles.dotNo) }} />
          <span style={{ color: configured ? 'var(--success)' : '#f87171' }}>
            {configured ? 'AI Configured' : 'AI Not Configured'}
          </span>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              style={styles.secondaryBtn}
              onClick={() => handlePreset(p)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>API Base URL</label>
            <input
              style={styles.input}
              placeholder="https://api.openai.com/v1"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
            />
            <span style={styles.hint}>The base URL of the OpenAI-compatible API endpoint</span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>API Key</label>
            <input
              type="password"
              style={styles.passwordInput}
              placeholder={savedApiKeyMasked ? `${savedApiKeyMasked} (leave blank to keep)` : 'sk-...'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
            <span style={styles.hint}>
              {savedApiKeyMasked
                ? `Currently set: ${savedApiKeyMasked}. Enter a new key to change.`
                : 'Your API key is stored locally in server-config.json'}
            </span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Model</label>
            <input
              style={styles.input}
              placeholder="gpt-4o-mini"
              value={model}
              onChange={e => setModel(e.target.value)}
            />
            <span style={styles.hint}>Model name, e.g. gpt-4o-mini, deepseek-chat, claude-3-5-sonnet</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            style={{
              ...styles.primaryBtn,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'wait' : 'pointer',
            }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            style={{
              ...styles.secondaryBtn,
              opacity: testing ? 0.7 : 1,
              cursor: testing ? 'wait' : 'pointer',
            }}
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {message && (
          <div style={message.type === 'success' ? styles.successBox : styles.errorBox}>
            {message.text}
          </div>
        )}

        {testResult && (
          <div style={{
            ...styles.testResult,
            borderColor: testResult.success ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
          }}>
            {testResult.success ? (
              <>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Connection successful</span>
                {testResult.reply && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                    Response: "{testResult.reply}"
                  </span>
                )}
              </>
            ) : (
              <span style={{ color: '#f87171' }}>
                Connection failed: {testResult.error}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
