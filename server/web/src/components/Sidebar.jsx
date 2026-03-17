import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/content', label: 'Content', icon: '⊟' },
  { to: '/search', label: 'Search', icon: '⊙' },
];

const styles = {
  sidebar: {
    width: 220,
    minWidth: 220,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
  },
  brand: {
    padding: '0 20px 24px',
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },
  brandSub: {
    display: 'block',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 400,
    marginTop: 2,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 8px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: 14,
    transition: 'all 0.15s',
  },
  linkActive: {
    background: 'var(--bg-hover)',
    color: 'var(--text-primary)',
  },
  icon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    padding: '16px 20px',
    fontSize: 11,
    color: 'var(--text-muted)',
  },
};

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <img src="/logo.svg" alt="logo" style={styles.brandLogo} />
        <div>
          EASE Context Hub
          <span style={styles.brandSub}>Console</span>
        </div>
      </div>
      <nav style={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            <span style={styles.icon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={styles.footer}>Self-hosted instance</div>
    </aside>
  );
}
