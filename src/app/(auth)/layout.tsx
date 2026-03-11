import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />
      {children}
    </div>
  );
}
