import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 24px',
  },
  cardLabel: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
  },
  sourceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sourceItem: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
  },
  badge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 500,
  },
  quickActions: {
    display: 'flex',
    gap: 12,
    marginBottom: 32,
  },
  actionBtn: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '10px 20px',
    color: 'var(--text-primary)',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState(null);
  const navigate = useNavigate();

  function loadStats() {
    fetch('/api/v1/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/health').then(r => r.json()).then(setHealth).catch(() => {});
  }

  useEffect(() => { loadStats(); }, []);

  function handleRebuild() {
    if (building) return;
    setBuilding(true);
    setBuildResult(null);
    fetch('/api/v1/build', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(r => r.json())
      .then(data => {
        setBuilding(false);
        setBuildResult(data);
        if (data.status === 'success') {
          loadStats();
        }
      })
      .catch(err => {
        setBuilding(false);
        setBuildResult({ status: 'failed', output: err.message });
      });
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>EASE Context Hub server overview</p>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Entries</div>
          <div style={styles.cardValue}>{stats?.counts?.total ?? '—'}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Docs</div>
          <div style={{ ...styles.cardValue, color: 'var(--accent)' }}>{stats?.counts?.docs ?? '—'}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Skills</div>
          <div style={{ ...styles.cardValue, color: 'var(--success)' }}>{stats?.counts?.skills ?? '—'}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Sources</div>
          <div style={styles.cardValue}>{stats?.sources?.length ?? '—'}</div>
        </div>
      </div>

      <div style={styles.quickActions}>
        <button
          style={styles.actionBtn}
          onClick={() => navigate('/search')}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          Search entries
        </button>
        <button
          style={styles.actionBtn}
          onClick={() => navigate('/content')}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          Browse content tree
        </button>
        <button
          style={{
            ...styles.actionBtn,
            background: building ? 'var(--bg-hover)' : 'var(--accent-dim)',
            color: '#fff',
            borderColor: 'var(--accent-dim)',
            opacity: building ? 0.7 : 1,
            cursor: building ? 'wait' : 'pointer',
          }}
          onClick={handleRebuild}
          disabled={building}
        >
          {building ? 'Rebuilding...' : 'Rebuild Index'}
        </button>
      </div>

      {buildResult && (
        <div style={{
          ...styles.section,
          background: buildResult.status === 'success' ? 'rgba(74, 222, 128, 0.06)' : 'rgba(251, 191, 36, 0.06)',
          border: `1px solid ${buildResult.status === 'success' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`,
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: buildResult.status === 'success' ? 'var(--success)' : 'var(--warning)' }}>
            {buildResult.status === 'success' ? 'Build succeeded' : 'Build failed'}
          </div>
          <pre style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--font-mono)' }}>
            {buildResult.output}
          </pre>
          {buildResult.note && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{buildResult.note}</div>}
        </div>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Sources</h2>
        <div style={styles.sourceList}>
          {stats?.sources?.map(src => (
            <div key={src.name} style={styles.sourceItem}>
              <span style={{ ...styles.badge, background: src.type === 'local' ? 'var(--accent-dim)' : 'var(--tag-bg)', color: src.type === 'local' ? '#fff' : 'var(--tag-text)' }}>
                {src.type}
              </span>
              <strong>{src.name}</strong>
              {src.path && <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{src.path}</span>}
              {src.lastUpdated && <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>Updated: {new Date(src.lastUpdated).toLocaleString()}</span>}
            </div>
          )) ?? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>}
        </div>
      </div>

      {health && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Server healthy — {health.timestamp}
        </div>
      )}
    </div>
  );
}
