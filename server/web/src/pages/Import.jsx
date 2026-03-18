import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarkdownPreview from '../components/MarkdownPreview';

const LANGUAGES = [
  'none',
  'javascript',
  'typescript',
  'python',
  'go',
  'rust',
  'java',
  'kotlin',
  'swift',
  'csharp',
  'ruby',
  'php',
  'shell',
];

const SOURCES = [
  { value: 'community', label: 'Community' },
  { value: 'maintainer', label: 'Maintainer' },
  { value: 'official', label: 'Official' },
];

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFrontmatterBrowser(content) {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return { attributes: {}, body: content };

  const yaml = match[1];
  const attributes = {};
  let currentSection = null;

  for (const line of yaml.split('\n')) {
    if (line.startsWith('metadata:')) {
      currentSection = 'metadata';
      attributes.metadata = {};
      continue;
    }
    if (currentSection === 'metadata' && line.trim() === '') {
      currentSection = null;
      continue;
    }
    if (currentSection === 'metadata' && !line.startsWith('  ') && !line.startsWith('\t')) {
      currentSection = null;
    }

    const idx = line.indexOf(':');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (currentSection === 'metadata') {
      const metaKey = line.slice(0, idx).trim();
      attributes.metadata[metaKey] = val;
    } else {
      attributes[key] = val;
    }
  }

  return { attributes, body: match[2] || '' };
}

function generatePreviewContent(formData, body) {
  const today = new Date().toISOString().split('T')[0];
  const langLine = formData.language && formData.language !== 'none'
    ? `  languages: "${formData.language}"\n` : '';
  const tagsLine = formData.tags ? `  tags: "${formData.tags}"\n` : '';

  const frontmatter = `---
name: ${formData.name}
description: "${formData.description}"
metadata:
${langLine}  versions: "${formData.version}"
  revision: 1
  updated-on: "${today}"
  source: ${formData.source}
${tagsLine}---`;

  return frontmatter + '\n' + body.trim() + '\n';
}

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
  tabRow: {
    display: 'flex',
    gap: 0,
    marginBottom: 24,
    borderBottom: '1px solid var(--border)',
  },
  tab: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
    transition: 'all 0.15s',
  },
  tabActive: {
    color: 'var(--text-primary)',
    borderBottom: '2px solid var(--accent)',
  },
  uploadZone: {
    border: '2px dashed var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: 24,
  },
  uploadZoneActive: {
    borderColor: 'var(--accent)',
    background: 'rgba(108, 140, 255, 0.05)',
  },
  uploadZoneHasFile: {
    borderColor: 'var(--success)',
    background: 'rgba(74, 222, 128, 0.05)',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 12,
    color: 'var(--text-muted)',
  },
  uploadText: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    fontSize: 14,
    color: 'var(--success)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
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
  input: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-mono)',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: 80,
    resize: 'vertical',
    fontFamily: 'var(--font-mono)',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: 12,
    color: '#f87171',
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  },
  primaryBtn: {
    padding: '12px 24px',
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
    padding: '12px 24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  previewCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
  },
  successBox: {
    background: 'rgba(74, 222, 128, 0.06)',
    border: '1px solid rgba(74, 222, 128, 0.2)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--success)',
    marginBottom: 8,
  },
  successPath: {
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    marginBottom: 4,
  },
  successHint: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  errorBox: {
    background: 'rgba(248, 113, 113, 0.06)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    marginBottom: 24,
    fontSize: 13,
    color: '#f87171',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    fontSize: 13,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  resultTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  resultTh: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid var(--border)',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  resultTd: {
    padding: '8px 12px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-primary)',
  },
  resultTdMono: {
    padding: '8px 12px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    maxWidth: 300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 500,
  },
  aiBadge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 500,
    background: 'rgba(108, 140, 255, 0.15)',
    color: 'var(--accent)',
  },
  batchFormGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
};

// ===== Single Import Component =====
function SingleImport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    author: '',
    name: '',
    description: '',
    language: 'none',
    version: '',
    source: 'community',
    tags: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  function updateField(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  }

  function handleFile(file) {
    if (!file || !file.name.endsWith('.md')) return;
    setFile(file);
    setApiError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);

      const { attributes } = parseFrontmatterBrowser(content);
      if (Object.keys(attributes).length > 0) {
        setFormData(prev => ({
          ...prev,
          name: attributes.name || prev.name,
          description: attributes.description || prev.description,
          language: attributes.metadata?.languages || prev.language,
          version: attributes.metadata?.versions || prev.version,
          source: attributes.metadata?.source || prev.source,
          tags: attributes.metadata?.tags || prev.tags,
        }));
      }
    };
    reader.readAsText(file);
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  function validate() {
    const errs = {};
    if (!formData.author) errs.author = 'Author is required';
    else if (!/^[a-z0-9-]+$/.test(formData.author)) errs.author = 'Lowercase letters, numbers, and hyphens only';
    if (!formData.name) errs.name = 'Name is required';
    else if (!/^[a-z0-9-]+$/.test(formData.name)) errs.name = 'Lowercase letters, numbers, and hyphens only';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.version.trim()) errs.version = 'Version is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    setResult(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!file) {
      setApiError('Please select a markdown file to upload.');
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('author', formData.author);
      body.append('name', formData.name);
      body.append('description', formData.description);
      body.append('language', formData.language !== 'none' ? formData.language : '');
      body.append('version', formData.version);
      body.append('source', formData.source);
      body.append('tags', formData.tags);

      const res = await fetch('/api/v1/import', { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || data.errors?.map(e => e.message).join(', ') || 'Import failed');
        return;
      }

      setResult(data);
    } catch (err) {
      setApiError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setFileContent('');
    setFormData({ author: '', name: '', description: '', language: 'none', version: '', source: 'community', tags: '' });
    setErrors({});
    setResult(null);
    setApiError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const previewContent = showPreview && (formData.name || formData.description || formData.version)
    ? generatePreviewContent(formData, fileContent)
    : null;

  if (result) {
    return (
      <div>
        <div style={styles.successBox}>
          <div style={styles.successTitle}>Document imported successfully</div>
          <div style={styles.successPath}>{result.path}</div>
          <div style={styles.successPath}>ID: {result.id}</div>
          <div style={styles.successHint}>{result.message}</div>
        </div>

        <div style={styles.actions}>
          <button style={styles.secondaryBtn} onClick={() => navigate('/content')}>Browse Content</button>
          <button style={styles.secondaryBtn} onClick={() => navigate('/')}>Go to Dashboard</button>
          <button style={styles.primaryBtn} onClick={handleReset}>Import Another</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {apiError && <div style={styles.errorBox}>{apiError}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Upload Markdown File</h2>
          <div
            style={{
              ...styles.uploadZone,
              ...(dragActive ? styles.uploadZoneActive : {}),
              ...(file ? styles.uploadZoneHasFile : {}),
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            {file ? (
              <div style={styles.fileInfo}>
                <span style={{ fontSize: 20 }}>&#10003;</span>
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <span
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  style={{ color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 8 }}
                >Change</span>
              </div>
            ) : (
              <>
                <div style={styles.uploadIcon}>&#8593;</div>
                <div style={styles.uploadText}>Drag and drop a markdown file here, or click to browse</div>
                <div style={styles.uploadHint}>Only .md files are accepted (max 50MB)</div>
              </>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Document Metadata</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Author *</label>
              <input
                style={{ ...styles.input, borderColor: errors.author ? '#f87171' : 'var(--border)' }}
                placeholder="e.g. openai, myorg"
                value={formData.author}
                onChange={e => updateField('author', e.target.value)}
              />
              {errors.author && <span style={styles.errorText}>{errors.author}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                style={{ ...styles.input, borderColor: errors.name ? '#f87171' : 'var(--border)' }}
                placeholder="e.g. chat-api, widgets"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
              />
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>

            <div style={styles.formGroupFull}>
              <label style={styles.label}>Description *</label>
              <textarea
                style={{ ...styles.textarea, borderColor: errors.description ? '#f87171' : 'var(--border)' }}
                placeholder="Brief description for search results"
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
              />
              {errors.description && <span style={styles.errorText}>{errors.description}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Language</label>
              <select
                style={styles.select}
                value={formData.language}
                onChange={e => updateField('language', e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'none' ? 'None (language-agnostic)' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Version *</label>
              <input
                style={{ ...styles.input, borderColor: errors.version ? '#f87171' : 'var(--border)' }}
                placeholder="e.g. 1.0.0"
                value={formData.version}
                onChange={e => updateField('version', e.target.value)}
              />
              {errors.version && <span style={styles.errorText}>{errors.version}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Source</label>
              <select
                style={styles.select}
                value={formData.source}
                onChange={e => updateField('source', e.target.value)}
              >
                {SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tags</label>
              <input
                style={styles.input}
                placeholder="comma-separated, e.g. api,http,rest"
                value={formData.tags}
                onChange={e => updateField('tags', e.target.value)}
              />
            </div>
          </div>

          {fileContent && (
            <label style={styles.toggleRow} onClick={() => setShowPreview(prev => !prev)}>
              <input type="checkbox" checked={showPreview} readOnly style={{ cursor: 'pointer' }} />
              Show document preview
            </label>
          )}
        </div>

        {previewContent && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Preview</h2>
            <div style={styles.previewCard}>
              <MarkdownPreview content={previewContent} />
            </div>
          </div>
        )}

        <div style={styles.actions}>
          <button
            type="submit"
            style={{
              ...styles.primaryBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import Document'}
          </button>
          <button type="button" style={styles.secondaryBtn} onClick={handleReset}>Reset</button>
        </div>
      </form>
    </div>
  );
}

// ===== Batch Import Component =====
function BatchImport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [defaultAuthor, setDefaultAuthor] = useState('');
  const [source, setSource] = useState('community');
  const [useAi, setUseAi] = useState(true);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch('/api/v1/import/config')
      .then(r => r.json())
      .then(data => {
        setAiAvailable(data.ai?.available || false);
        if (!data.ai?.available) setUseAi(false);
      })
      .catch(() => {});
  }, []);

  function handleZipFile(zipFile) {
    if (!zipFile || !zipFile.name.endsWith('.zip')) return;
    setFile(zipFile);
    setApiError(null);
    setResult(null);
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleZipFile(e.dataTransfer.files[0]);
    }
  }, []);

  function validate() {
    const errs = {};
    if (!defaultAuthor) errs.defaultAuthor = 'Default author is required';
    else if (!/^[a-z0-9-]+$/.test(defaultAuthor)) errs.defaultAuthor = 'Lowercase letters, numbers, and hyphens only';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    setResult(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!file) {
      setApiError('Please select a zip file to upload.');
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('defaultAuthor', defaultAuthor);
      body.append('source', source);
      body.append('useAi', String(useAi));

      const res = await fetch('/api/v1/import/batch', { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || 'Batch import failed');
        return;
      }

      setResult(data);
    } catch (err) {
      setApiError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setDefaultAuthor('');
    setSource('community');
    setResult(null);
    setApiError(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Batch result view
  if (result) {
    return (
      <div>
        <div style={styles.successBox}>
          <div style={styles.successTitle}>
            Batch import complete: {result.imported} imported, {result.skipped} skipped, {result.failed} failed (out of {result.total})
          </div>
          <div style={styles.successHint}>Run "Rebuild Index" to make imported documents searchable.</div>
        </div>

        {result.results.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Imported Documents</h3>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <table style={styles.resultTable}>
                <thead>
                  <tr>
                    <th style={styles.resultTh}>Source File</th>
                    <th style={styles.resultTh}>ID</th>
                    <th style={styles.resultTh}>Path</th>
                    <th style={styles.resultTh}>AI</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r, i) => (
                    <tr key={i}>
                      <td style={styles.resultTdMono} title={r.file}>{r.file}</td>
                      <td style={styles.resultTd}>
                        <a
                          href={`/doc/${encodeURIComponent(r.id)}`}
                          style={{ color: 'var(--accent)', textDecoration: 'none' }}
                          onClick={e => { e.preventDefault(); navigate(`/doc/${r.id}`); }}
                        >{r.id}</a>
                      </td>
                      <td style={styles.resultTdMono} title={r.path}>{r.path}</td>
                      <td style={styles.resultTd}>
                        {r.aiGenerated ? <span style={styles.aiBadge}>AI Generated</span> : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result.errors.length > 0 && (
          <div style={styles.section}>
            <h3 style={{ ...styles.sectionTitle, color: 'var(--warning)' }}>Errors / Skipped</h3>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <table style={styles.resultTable}>
                <thead>
                  <tr>
                    <th style={styles.resultTh}>File</th>
                    <th style={styles.resultTh}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((e, i) => (
                    <tr key={i}>
                      <td style={styles.resultTdMono} title={e.file}>{e.file}</td>
                      <td style={{ ...styles.resultTd, color: '#f87171', fontSize: 12 }}>{e.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={styles.actions}>
          <button style={styles.secondaryBtn} onClick={() => navigate('/content')}>Browse Content</button>
          <button style={styles.secondaryBtn} onClick={() => navigate('/')}>Go to Dashboard</button>
          <button style={styles.primaryBtn} onClick={handleReset}>Import Another</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {apiError && <div style={styles.errorBox}>{apiError}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Upload ZIP Archive</h2>
          <div
            style={{
              ...styles.uploadZone,
              ...(dragActive ? styles.uploadZoneActive : {}),
              ...(file ? styles.uploadZoneHasFile : {}),
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={e => e.target.files?.[0] && handleZipFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            {file ? (
              <div style={styles.fileInfo}>
                <span style={{ fontSize: 20 }}>&#10003;</span>
                <span>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                <span
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  style={{ color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 8 }}
                >Change</span>
              </div>
            ) : (
              <>
                <div style={styles.uploadIcon}>&#8593;</div>
                <div style={styles.uploadText}>Drag and drop a zip archive here, or click to browse</div>
                <div style={styles.uploadHint}>
                  Supports standard content structure or flat DOC.md collection (max 50MB)
                </div>
              </>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Import Settings</h2>
          <div style={styles.batchFormGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Default Author *</label>
              <input
                style={{ ...styles.input, borderColor: errors.defaultAuthor ? '#f87171' : 'var(--border)' }}
                placeholder="e.g. myorg, myteam"
                value={defaultAuthor}
                onChange={e => { setDefaultAuthor(e.target.value); setErrors(prev => ({ ...prev, defaultAuthor: null })); }}
              />
              {errors.defaultAuthor && <span style={styles.errorText}>{errors.defaultAuthor}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Source</label>
              <select
                style={styles.select}
                value={source}
                onChange={e => setSource(e.target.value)}
              >
                {SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>AI Auto-fill</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={styles.toggleRow}>
                  <input
                    type="checkbox"
                    checked={useAi}
                    disabled={!aiAvailable}
                    onChange={e => setUseAi(e.target.checked)}
                    style={{ cursor: aiAvailable ? 'pointer' : 'not-allowed' }}
                  />
                  Use AI for missing frontmatter
                </label>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {aiAvailable
                    ? `AI enabled (${process.env.AI_MODEL || 'gpt-4o-mini'})`
                    : 'AI not configured (set OPENAI_API_KEY)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            type="submit"
            style={{
              ...styles.primaryBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import Archive'}
          </button>
          <button type="button" style={styles.secondaryBtn} onClick={handleReset}>Reset</button>
        </div>
      </form>
    </div>
  );
}

// ===== Main Import Page =====
export default function Import() {
  const [mode, setMode] = useState('single');

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Import</h1>
        <p style={styles.subtitle}>Upload markdown documents to the content registry</p>
      </div>

      <div style={styles.tabRow}>
        <div
          style={{
            ...styles.tab,
            ...(mode === 'single' ? styles.tabActive : {}),
          }}
          onClick={() => setMode('single')}
        >
          Single File
        </div>
        <div
          style={{
            ...styles.tab,
            ...(mode === 'batch' ? styles.tabActive : {}),
          }}
          onClick={() => setMode('batch')}
        >
          Batch (ZIP)
        </div>
      </div>

      {mode === 'single' ? <SingleImport /> : <BatchImport />}
    </div>
  );
}
