import styles from './page.module.css';

export default function DashboardLoading() {
  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(12px)',
        minHeight: '64px',
      }}>
        <div>
          <div style={{ width: 120, height: 20, borderRadius: 6, background: 'var(--bg-hover)', marginBottom: 4 }} />
          <div style={{ width: 220, height: 14, borderRadius: 6, background: 'var(--bg-hover)' }} />
        </div>
      </header>
      <div className={styles.page}>
        {/* Stat Cards Skeleton */}
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-hover)', marginBottom: 12 }} />
              <div style={{ width: '60%', height: 12, borderRadius: 4, background: 'var(--bg-hover)', marginBottom: 8 }} />
              <div style={{ width: '80%', height: 20, borderRadius: 4, background: 'var(--bg-hover)', marginBottom: 6 }} />
              <div style={{ width: '50%', height: 10, borderRadius: 4, background: 'var(--bg-hover)' }} />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className={styles.chartsRow}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <div style={{ width: 180, height: 16, borderRadius: 4, background: 'var(--bg-hover)', marginBottom: 8 }} />
            <div style={{ width: 100, height: 12, borderRadius: 4, background: 'var(--bg-hover)', marginBottom: 20 }} />
            <div style={{ width: '100%', height: 260, borderRadius: 8, background: 'var(--bg-hover)' }} />
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <div style={{ width: 100, height: 16, borderRadius: 4, background: 'var(--bg-hover)', marginBottom: 24 }} />
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, padding: '24px 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-hover)' }} />
              <div style={{ width: 60, height: 40, borderRadius: 8, background: 'var(--bg-hover)' }} />
              <div style={{ width: 120, height: 12, borderRadius: 4, background: 'var(--bg-hover)' }} />
            </div>
          </div>
        </div>

        {/* Bottom Row Skeleton */}
        <div className={styles.bottomRow}>
          {[1, 2].map((i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <div style={{ width: 120, height: 16, borderRadius: 4, background: 'var(--bg-hover)', marginBottom: 16 }} />
              {[1, 2, 3].map((j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-hover)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '70%', height: 12, borderRadius: 4, background: 'var(--bg-hover)', marginBottom: 4 }} />
                    <div style={{ width: '40%', height: 10, borderRadius: 4, background: 'var(--bg-hover)' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
